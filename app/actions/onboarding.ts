'use server';

import { createServerClient, createServerClientWithCookies } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get all onboarding documents for a user (with their completion status)
export async function getUserOnboardingDocuments(userId?: string) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const targetUserId = userId || currentUser.id;
    const supabase = createServerClient();

    // Get all onboarding documents
    const { data: documents, error: docsError } = await supabase
      .from('onboarding_documents')
      .select('*')
      .eq('document_type', 'onboarding')
      .order('order_index', { ascending: true });

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return { success: false, error: 'Failed to fetch documents' };
    }

    // Get user's acknowledgments for these documents
    const { data: acknowledgments, error: ackError } = await supabase
      .from('document_acknowledgments')
      .select('*')
      .eq('user_id', targetUserId);

    if (ackError) {
      console.error('Error fetching acknowledgments:', ackError);
    }

    // Merge documents with their completion status
    const documentsWithStatus = (documents || []).map(doc => {
      const ack = (acknowledgments || []).find(a => a.document_id === doc.id);
      return {
        ...doc,
        status: ack?.status || 'pending',
        acknowledged_at: ack?.acknowledged_at || null,
        signature_url: ack?.signature_url || null,
        form_data: ack?.form_data || null,
        acknowledgment_id: ack?.id || null,
      };
    });

    return { success: true, data: documentsWithStatus };
  } catch (error) {
    console.error('getUserOnboardingDocuments error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get a single document with user's status
export async function getOnboardingDocument(documentId: string) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createServerClient();

    // Get the document
    const { data: document, error: docError } = await supabase
      .from('onboarding_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return { success: false, error: 'Document not found' };
    }

    // Get user's acknowledgment for this document
    const { data: acknowledgment } = await supabase
      .from('document_acknowledgments')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', currentUser.id)
      .single();

    return {
      success: true,
      data: {
        ...document,
        status: acknowledgment?.status || 'pending',
        acknowledged_at: acknowledgment?.acknowledged_at || null,
        signature_url: acknowledgment?.signature_url || null,
        form_data: acknowledgment?.form_data || null,
        acknowledgment_id: acknowledgment?.id || null,
      },
    };
  } catch (error) {
    console.error('getOnboardingDocument error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Acknowledge/complete a document
export async function acknowledgeDocument(input: {
  documentId: string;
  signatureUrl?: string;
  formData?: Record<string, unknown>;
}) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createServerClient();

    // Check if document exists and requires signature
    const { data: document } = await supabase
      .from('onboarding_documents')
      .select('*')
      .eq('id', input.documentId)
      .single();

    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    if (document.requires_signature && !input.signatureUrl) {
      return { success: false, error: 'This document requires a signature' };
    }

    // Check if acknowledgment already exists
    const { data: existingAck } = await supabase
      .from('document_acknowledgments')
      .select('id')
      .eq('document_id', input.documentId)
      .eq('user_id', currentUser.id)
      .single();

    if (existingAck) {
      // Update existing acknowledgment
      const { error } = await supabase
        .from('document_acknowledgments')
        .update({
          status: 'completed',
          signature_url: input.signatureUrl || null,
          form_data: input.formData || null,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', existingAck.id);

      if (error) {
        console.error('Error updating acknowledgment:', error);
        return { success: false, error: 'Failed to update acknowledgment' };
      }
    } else {
      // Create new acknowledgment
      const { error } = await supabase
        .from('document_acknowledgments')
        .insert({
          document_id: input.documentId,
          user_id: currentUser.id,
          status: 'completed',
          signature_url: input.signatureUrl || null,
          form_data: input.formData || null,
          acknowledged_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating acknowledgment:', error);
        return { success: false, error: 'Failed to create acknowledgment' };
      }
    }

    // Check if all required documents are completed
    await updateOnboardingStatus(currentUser.id);

    revalidatePath('/dashboard/onboarding');
    return { success: true, message: 'Document acknowledged successfully' };
  } catch (error) {
    console.error('acknowledgeDocument error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update user's overall onboarding status
async function updateOnboardingStatus(userId: string) {
  const supabase = createServerClient();

  // Get all required onboarding documents
  const { data: requiredDocs } = await supabase
    .from('onboarding_documents')
    .select('id')
    .eq('document_type', 'onboarding')
    .eq('is_required', true);

  if (!requiredDocs || requiredDocs.length === 0) return;

  // Get user's completed acknowledgments
  const { data: completedAcks } = await supabase
    .from('document_acknowledgments')
    .select('document_id')
    .eq('user_id', userId)
    .eq('status', 'completed');

  const completedDocIds = new Set((completedAcks || []).map(a => a.document_id));
  const allCompleted = requiredDocs.every(doc => completedDocIds.has(doc.id));

  // Update user's onboarding status
  if (allCompleted) {
    await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', userId);
  }
}

// Admin: Assign all onboarding documents to a new user
export async function assignAllOnboardingDocuments(userId: string) {
  try {
    const supabase = createServerClient();

    // Get all onboarding documents
    const { data: documents } = await supabase
      .from('onboarding_documents')
      .select('id')
      .eq('document_type', 'onboarding');

    if (!documents || documents.length === 0) {
      return { success: true, message: 'No onboarding documents to assign' };
    }

    // Create pending acknowledgments for each document
    for (const doc of documents) {
      const { data: existing } = await supabase
        .from('document_acknowledgments')
        .select('id')
        .eq('document_id', doc.id)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        await supabase
          .from('document_acknowledgments')
          .insert({
            document_id: doc.id,
            user_id: userId,
            status: 'pending',
          });
      }
    }

    return { success: true, message: 'All onboarding documents assigned' };
  } catch (error) {
    console.error('assignAllOnboardingDocuments error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get user's onboarding progress
export async function getOnboardingProgress(userId?: string) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const targetUserId = userId || currentUser.id;
    const supabase = createServerClient();

    // Get all required onboarding documents
    const { data: requiredDocs } = await supabase
      .from('onboarding_documents')
      .select('id')
      .eq('document_type', 'onboarding')
      .eq('is_required', true);

    // Get completed acknowledgments
    const { data: completedAcks } = await supabase
      .from('document_acknowledgments')
      .select('document_id')
      .eq('user_id', targetUserId)
      .eq('status', 'completed');

    const totalRequired = requiredDocs?.length || 0;
    const completed = completedAcks?.length || 0;
    const percentage = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0;

    return {
      success: true,
      data: {
        total: totalRequired,
        completed,
        percentage,
        isComplete: completed >= totalRequired && totalRequired > 0,
      },
    };
  } catch (error) {
    console.error('getOnboardingProgress error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
