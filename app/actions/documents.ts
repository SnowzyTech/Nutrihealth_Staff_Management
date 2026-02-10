'use server';

import { createServerClient, createServerClientWithCookies } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditTrail } from '@/lib/utils/audit-log';

export interface CreateDocumentInput {
  title: string;
  description: string;
  content: string;
  documentType: 'onboarding' | 'handbook' | 'training' | 'policy' | 'hr_records' | 'other';
  isRequired: boolean;
  fileUrl?: string;
  onboardingSubtype?: 'nda' | 'guarantor_form' | 'biodata' | 'contract_letter' | 'offer_letter';
  hrSubtype?: 'promotion_letter' | 'query_letter' | 'warning_letter' | 'appraisal_report' | 'leave_record' | 'salary_information';
  assignedStaffId?: string; // For HR records assigned to specific staff
}

export async function createDocument(input: CreateDocumentInput) {
  try {
    // Use cookie-based client to get current user session
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    // Use admin client for database operations
    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can create documents' };
    }

    // Get the next order_index
    const { data: existingDocs } = await supabase
      .from('onboarding_documents')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = (existingDocs?.[0]?.order_index || 0) + 1;

// Prepare the document metadata including subtypes
    const documentMetadata: Record<string, string | undefined> = {};
    if (input.onboardingSubtype) {
      documentMetadata.onboarding_subtype = input.onboardingSubtype;
    }
    if (input.hrSubtype) {
      documentMetadata.hr_subtype = input.hrSubtype;
    }

    const { data, error } = await supabase
      .from('onboarding_documents')
      .insert({
        title: input.title,
        description: input.description,
        content: input.content,
        document_type: input.documentType,
        is_required: input.isRequired,
        file_url: input.fileUrl || null,
        order_index: nextOrderIndex,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        metadata: Object.keys(documentMetadata).length > 0 ? documentMetadata : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Document creation error:', error);
      return { success: false, error: error.message };
    }

    // Log audit trail for document creation
    await logAuditTrail(
      currentUser.id,
      'create_document',
      'document',
      data.id,
      { title: input.title, document_type: input.documentType }
    );

    revalidatePath('/admin/documents');
    return { success: true, message: 'Document created successfully', data };
  } catch (error) {
    console.error('Create document error:', error);
    return { success: false, error: 'Failed to create document' };
  }
}

export async function getAllDocuments() {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('onboarding_documents')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Fetch documents error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get documents error:', error);
    return { success: false, error: 'Failed to fetch documents' };
  }
}

// Get all submissions for admin view (includes onboarding + HR record submissions)
export async function getAllSubmissions() {
  try {
    const supabase = createServerClient();

    // 1. Get onboarding document submissions
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_progress')
      .select(`
        id,
        user_id,
        document_id,
        completed_at,
        notes,
        status,
        users:user_id (first_name, last_name, email),
        onboarding_documents:document_id (id, title, description, document_type)
      `)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (onboardingError) {
      console.error('Fetch onboarding submissions error:', onboardingError);
    }

    // Format onboarding submissions
    const onboardingSubmissions = (onboardingData || []).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      document_id: item.document_id,
      completed_at: item.completed_at || '',
      notes: item.notes,
      status: item.status as 'submitted' | 'approved' | 'rejected' | null,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
      document: Array.isArray(item.onboarding_documents)
        ? item.onboarding_documents[0]
        : item.onboarding_documents,
    }));

    // 2. Get HR record acknowledgments (from hr_records table)
    const { data: hrData, error: hrError } = await supabase
      .from('hr_records')
      .select(`
        id,
        user_id,
        record_type,
        title,
        description,
        acknowledged_at,
        acknowledgment_notes,
        users:user_id (first_name, last_name, email)
      `)
      .not('acknowledged_at', 'is', null)
      .order('acknowledged_at', { ascending: false });

    if (hrError) {
      console.error('Fetch HR submissions error:', hrError);
    }

    // Format HR record submissions to match the same interface
    const hrSubmissions = (hrData || []).map((item) => ({
      id: `hr-${item.id}`,
      user_id: item.user_id,
      document_id: item.id,
      completed_at: item.acknowledged_at || '',
      notes: item.acknowledgment_notes || null,
      status: 'approved' as 'submitted' | 'approved' | 'rejected' | null,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
      document: {
        id: item.id,
        title: item.title || item.record_type?.replace(/_/g, ' ') || 'HR Record',
        description: item.description || 'HR Record submission',
        document_type: 'hr_records',
      },
    }));

    // Combine and sort by date
    const allSubmissions = [...onboardingSubmissions, ...hrSubmissions].sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    return { success: true, data: allSubmissions };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return { success: false, error: 'Failed to fetch submissions', data: [] };
  }
}

export async function getHandbookDocuments() {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('onboarding_documents')
      .select('*')
      .eq('document_type', 'handbook')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Fetch handbook documents error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get handbook documents error:', error);
    return { success: false, error: 'Failed to fetch handbook documents' };
  }
}

export async function getDocumentById(documentId: string) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('onboarding_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Fetch document error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get document error:', error);
    return { success: false, error: 'Failed to fetch document' };
  }
}

export async function updateDocument(input: {
  documentId: string;
  title?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  isRequired?: boolean;
}) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can edit documents' };
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.fileUrl !== undefined) updateData.file_url = input.fileUrl;
    if (input.isRequired !== undefined) updateData.is_required = input.isRequired;

    const { error } = await supabase
      .from('onboarding_documents')
      .update(updateData)
      .eq('id', input.documentId);

    if (error) {
      console.error('Update document error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/documents');
    return { success: true, message: 'Document updated successfully' };
  } catch (error) {
    console.error('Update document error:', error);
    return { success: false, error: 'Failed to update document' };
  }
}

export async function updateDocumentMetadata(documentId: string, metadata: Record<string, unknown>) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can update document metadata' };
    }

    const { error } = await supabase
      .from('onboarding_documents')
      .update({ metadata })
      .eq('id', documentId);

    if (error) {
      console.error('Update metadata error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/documents');
    return { success: true, message: 'Document metadata updated successfully' };
  } catch (error) {
    console.error('Update document metadata error:', error);
    return { success: false, error: 'Failed to update document metadata' };
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can delete documents' };
    }

    const { error } = await supabase
      .from('onboarding_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/documents');
    return { success: true, message: 'Document deleted successfully' };
  } catch (error) {
    console.error('Delete document error:', error);
    return { success: false, error: 'Failed to delete document' };
  }
}

// Assign a document to a specific staff member
export async function assignDocumentToStaff(documentId: string, staffId: string) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can assign documents' };
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('onboarding_progress')
      .select('id')
      .eq('user_id', staffId)
      .eq('document_id', documentId)
      .single();

    if (existing) {
      return { success: false, error: 'Document already assigned to this staff member' };
    }

    // Create the assignment
    const { data, error } = await supabase
      .from('onboarding_progress')
      .insert({
        user_id: staffId,
        document_id: documentId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Assignment error:', error);
      return { success: false, error: error.message };
    }

    // Create notification for the staff member
    await supabase.from('notifications').insert({
      user_id: staffId,
      title: 'New Document Assigned',
      message: 'A new document has been assigned to you for review.',
      type: 'document_assignment',
      related_resource_type: 'document',
      related_resource_id: documentId,
      is_read: false,
    });

    revalidatePath('/admin/documents');
    revalidatePath('/dashboard/onboarding');
    return { success: true, message: 'Document assigned successfully', data };
  } catch (error) {
    console.error('Assign document error:', error);
    return { success: false, error: 'Failed to assign document' };
  }
}

// Assign a document to all active staff members
export async function assignDocumentToAllStaff(documentId: string) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can assign documents' };
    }

    // Get all active staff (non-admin)
    const { data: staffList, error: staffError } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true)
      .neq('role', 'admin');

    if (staffError) {
      return { success: false, error: staffError.message };
    }

    if (!staffList || staffList.length === 0) {
      return { success: false, error: 'No active staff members found' };
    }

    // Get already assigned staff for this document
    const { data: existingAssignments } = await supabase
      .from('onboarding_progress')
      .select('user_id')
      .eq('document_id', documentId);

    const assignedUserIds = new Set(existingAssignments?.map(a => a.user_id) || []);

    // Filter out already assigned staff
    const staffToAssign = staffList.filter(staff => !assignedUserIds.has(staff.id));

    if (staffToAssign.length === 0) {
      return { success: true, message: 'Document already assigned to all staff members', assignedCount: 0 };
    }

    // Create assignments for each staff member
    const assignments = staffToAssign.map(staff => ({
      user_id: staff.id,
      document_id: documentId,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('onboarding_progress')
      .insert(assignments);

    if (insertError) {
      console.error('Bulk assignment error:', insertError);
      return { success: false, error: insertError.message };
    }

    // Create notifications for all assigned staff
    const notifications = staffToAssign.map(staff => ({
      user_id: staff.id,
      title: 'New Document Assigned',
      message: 'A new document has been assigned to you for review.',
      type: 'document_assignment',
      related_resource_type: 'document',
      related_resource_id: documentId,
      is_read: false,
    }));

    await supabase.from('notifications').insert(notifications);

    revalidatePath('/admin/documents');
    revalidatePath('/dashboard/onboarding');
    return { 
      success: true, 
      message: `Document assigned to ${staffToAssign.length} staff member(s)`, 
      assignedCount: staffToAssign.length 
    };
  } catch (error) {
    console.error('Bulk assign document error:', error);
    return { success: false, error: 'Failed to assign document to all staff' };
  }
}

// Get document assignment status
export async function getDocumentAssignments(documentId: string) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select(`
        id,
        user_id,
        completed_at,
        signed_at,
        created_at,
        users:user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('document_id', documentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get assignments error:', error);
    return { success: false, error: 'Failed to fetch assignments' };
  }
}

// Get documents assigned to a specific user (for staff dashboard)
export async function getAssignedDocuments(userId: string) {
  try {
  const supabase = createServerClient();
  
  // Get all documents assigned to this user via onboarding_progress
  const { data, error } = await supabase
  .from('onboarding_progress')
  .select(`
  id,
  completed_at,
  signed_at,
  signature_url,
  notes,
  status,
  created_at,
  document:document_id (
  id,
  title,
  description,
  content,
  file_url,
  document_type,
  is_required,
  order_index,
  metadata
  )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch assigned documents error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get assigned documents error:', error);
    return { success: false, error: 'Failed to fetch assigned documents' };
  }
}

// Get a single document with its progress for a user
export async function getDocumentWithProgress(documentId: string, userId: string) {
  try {
    const supabase = createServerClient();
    
    // First, try to get the document directly
    const { data: document, error: docError } = await supabase
      .from('onboarding_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      // If not found by document ID, maybe the ID is the progress ID
      // Try to get via onboarding_progress
      const { data: progressWithDoc, error: progressError } = await supabase
        .from('onboarding_progress')
        .select(`
          id,
          completed_at,
          signed_at,
          signature_url,
          notes,
          status,
          form_data,
          admin_comments,
          reviewed_at,
          created_at,
          document:document_id (
            id,
            title,
            description,
            content,
            file_url,
            document_type,
            is_required,
            order_index,
            metadata
          )
        `)
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .single();

      if (progressError || !progressWithDoc) {
        // Last attempt: check if the documentId is actually a progress ID
        const { data: progressById, error: byIdError } = await supabase
          .from('onboarding_progress')
          .select(`
            id,
            completed_at,
            signed_at,
            signature_url,
            notes,
            status,
            form_data,
            admin_comments,
            reviewed_at,
            created_at,
            document:document_id (
              id,
              title,
              description,
              content,
              file_url,
              document_type,
              is_required,
              order_index,
              metadata
            )
          `)
          .eq('id', documentId)
          .eq('user_id', userId)
          .single();

        if (byIdError || !progressById || !progressById.document) {
          return { success: false, error: 'Document not found' };
        }

        return {
          success: true,
          data: {
            document: progressById.document as unknown as {
              id: string;
              title: string;
              description: string;
              content: string;
              file_url: string | null;
              document_type: string;
              is_required: boolean;
              order_index: number;
              metadata: Record<string, string> | null;
            },
            progress: {
              id: progressById.id,
              completed_at: progressById.completed_at,
              signed_at: progressById.signed_at,
              signature_url: progressById.signature_url,
              notes: progressById.notes,
              status: progressById.status,
              form_data: progressById.form_data,
              admin_comments: progressById.admin_comments,
              reviewed_at: progressById.reviewed_at,
            },
          },
        };
      }

      return {
        success: true,
        data: {
          document: progressWithDoc.document as unknown as {
            id: string;
            title: string;
            description: string;
            content: string;
            file_url: string | null;
            document_type: string;
            is_required: boolean;
            order_index: number;
            metadata: Record<string, string> | null;
          },
          progress: {
            id: progressWithDoc.id,
            completed_at: progressWithDoc.completed_at,
            signed_at: progressWithDoc.signed_at,
            signature_url: progressWithDoc.signature_url,
            notes: progressWithDoc.notes,
            status: progressWithDoc.status,
            form_data: progressWithDoc.form_data,
            admin_comments: progressWithDoc.admin_comments,
            reviewed_at: progressWithDoc.reviewed_at,
          },
        },
      };
    }

    // Document found directly, now get the progress
    const { data: progress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    return {
      success: true,
      data: {
        document,
        progress: progress || null,
      },
    };
  } catch (error) {
    console.error('Get document with progress error:', error);
    return { success: false, error: 'Failed to fetch document' };
  }
}

// Mark a document as complete
export async function markDocumentComplete(input: {
  documentId: string;
  userId: string;
  notes?: string;
  signatureUrl?: string;
}) {
  try {
    const supabase = createServerClient();

    // Check if progress entry exists
    const { data: existingProgress } = await supabase
      .from('onboarding_progress')
      .select('id')
      .eq('document_id', input.documentId)
      .eq('user_id', input.userId)
      .single();

    const now = new Date().toISOString();

    if (existingProgress) {
      // Update existing progress - set status to 'submitted' for admin review
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          status: 'submitted',
          completed_at: now,
          last_saved_at: now,
          notes: input.notes || null,
          signature_url: input.signatureUrl || null,
        })
        .eq('id', existingProgress.id);

      if (error) {
        console.error('Update progress error:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new progress entry - set status to 'submitted' for admin review
      const { error } = await supabase
        .from('onboarding_progress')
        .insert({
          document_id: input.documentId,
          user_id: input.userId,
          status: 'submitted',
          completed_at: now,
          last_saved_at: now,
          notes: input.notes || null,
          signature_url: input.signatureUrl || null,
        });

      if (error) {
        console.error('Create progress error:', error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/dashboard/onboarding');
    return { success: true, message: 'Document submitted for admin review' };
  } catch (error) {
    console.error('Mark document complete error:', error);
    return { success: false, error: 'Failed to save progress' };
  }
}

// Approve or reject a document submission
export async function approveDocumentSubmission(input: {
  progressId: string;
  approved: boolean;
  adminComments?: string;
}) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can approve documents' };
    }

    const now = new Date().toISOString();
    const newStatus = input.approved ? 'approved' : 'rejected';

    const { error } = await supabase
      .from('onboarding_progress')
      .update({
        status: newStatus,
        reviewed_by: currentUser.id,
        reviewed_at: now,
        admin_comments: input.adminComments || null,
      })
      .eq('id', input.progressId);

    if (error) {
      console.error('Approval error:', error);
      return { success: false, error: error.message };
    }

    // Get the submission details for notification
    const { data: submission } = await supabase
      .from('onboarding_progress')
      .select(`
        user_id,
        document:document_id (
          title
        )
      `)
      .eq('id', input.progressId)
      .single();

    // Create notification for the staff member
    if (submission) {
      const message = input.approved 
        ? `Your document "${submission.document?.title}" has been approved.`
        : `Your document "${submission.document?.title}" was rejected. Admin comments: ${input.adminComments || 'No comments provided.'}`;

      await supabase.from('notifications').insert({
        user_id: submission.user_id,
        title: input.approved ? 'Document Approved' : 'Document Rejected',
        message,
        type: 'document_approval',
        related_resource_type: 'document',
        related_resource_id: input.progressId,
        is_read: false,
      });
    }

    // Log audit trail for document approval/rejection
    await logAuditTrail(
      currentUser.id,
      input.approved ? 'approve_document' : 'reject_document',
      'document',
      input.progressId,
      { 
        action: input.approved ? 'approved' : 'rejected',
        admin_comments: input.adminComments || null,
        document_title: submission?.document?.title || 'Unknown'
      }
    );

    revalidatePath('/admin/submissions');
    revalidatePath('/dashboard/onboarding');
    return { 
      success: true, 
      message: input.approved ? 'Document approved successfully' : 'Document rejected successfully' 
    };
  } catch (error) {
    console.error('Approve document error:', error);
    return { success: false, error: 'Failed to process approval' };
  }
}

// Create HR Record and assign to a specific staff member
export async function createHRRecord(input: {
  title: string;
  description: string;
  content: string;
  hrSubtype: 'promotion_letter' | 'query_letter' | 'warning_letter' | 'appraisal_report' | 'leave_record' | 'salary_information';
  fileUrl?: string;
  staffId: string;
}) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can create HR records' };
    }

    // Insert into hr_records table
    const { data, error } = await supabase
      .from('hr_records')
      .insert({
        user_id: input.staffId,
        record_type: input.hrSubtype,
        title: input.title,
        description: input.description,
        content: input.content || input.description,
        file_url: input.fileUrl || null,
        visibility: 'private',
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('HR Record creation error:', error);
      return { success: false, error: error.message };
    }

    // Create notification for the staff member
    const hrTypeLabels: Record<string, string> = {
      promotion_letter: 'Promotion Letter',
      query_letter: 'Query Letter',
      warning_letter: 'Warning Letter',
      appraisal_report: 'Appraisal Report',
      leave_record: 'Leave Record',
      salary_information: 'Salary Information',
    };

    await supabase.from('notifications').insert({
      user_id: input.staffId,
      title: 'New HR Record Added',
      message: `A new ${hrTypeLabels[input.hrSubtype] || 'HR document'} has been added to your records.`,
      type: 'hr_record',
      related_resource_type: 'hr_record',
      related_resource_id: data.id,
      is_read: false,
    });

    revalidatePath('/admin/documents');
    revalidatePath('/dashboard/hr-records');
    return { success: true, message: 'HR record created successfully', data };
  } catch (error) {
    console.error('Create HR record error:', error);
    return { success: false, error: 'Failed to create HR record' };
  }
}

// Get HR records for a specific staff member (for staff dashboard)
export async function getStaffHRRecords(userId: string) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('hr_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch HR records error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get HR records error:', error);
    return { success: false, error: 'Failed to fetch HR records' };
  }
}

// Get all HR records (for admin)
export async function getAllHRRecords() {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can view all HR records' };
    }

    const { data, error } = await supabase
      .from('hr_records')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch all HR records error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get all HR records error:', error);
    return { success: false, error: 'Failed to fetch HR records' };
  }
}

// Save draft form data (auto-save)
export async function saveDraftFormData(
  documentId: string,
  userId: string,
  formData: Record<string, unknown>
) {
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Check if progress entry exists
    const { data: existingProgress } = await supabase
      .from('onboarding_progress')
      .select('id, status')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (existingProgress) {
      // Don't overwrite if already submitted/approved/rejected
      if (['submitted', 'approved', 'rejected'].includes(existingProgress.status)) {
        return { success: false, error: 'Cannot modify a submitted document' };
      }

      // Update existing progress
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          form_data: formData,
          status: 'draft',
          last_saved_at: now,
        })
        .eq('id', existingProgress.id);

      if (error) {
        console.error('Update draft error:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('onboarding_progress')
        .insert({
          document_id: documentId,
          user_id: userId,
          form_data: formData,
          status: 'draft',
          last_saved_at: now,
        });

      if (error) {
        console.error('Create draft error:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true, message: 'Draft saved' };
  } catch (error) {
    console.error('Save draft error:', error);
    return { success: false, error: 'Failed to save draft' };
  }
}

/**
 * Submit completed document with uploaded file URL
 * Used for download-fill-upload workflow
 */
export async function submitCompletedDocument({
  documentId,
  userId,
  uploadedFileUrl,
  notes = '',
  originalFilename,
}: {
  documentId: string;
  userId: string;
  uploadedFileUrl: string;
  notes?: string;
  originalFilename?: string;
}) {
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Check if progress entry exists
    const { data: existingProgress } = await supabase
      .from('onboarding_progress')
      .select('id, status')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    const formData = {
      uploaded_file_url: uploadedFileUrl,
      uploaded_at: now,
      original_filename: originalFilename || 'completed_document.pdf',
    };

    if (existingProgress) {
      // Don't allow re-submission if already approved
      if (existingProgress.status === 'approved') {
        return { success: false, error: 'This document has already been approved' };
      }

      // Update existing progress
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          form_data: formData,
          status: 'submitted',
          completed_at: now,
          last_saved_at: now,
          notes: notes || null,
        })
        .eq('id', existingProgress.id);

      if (error) {
        console.error('Submit document error:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new progress entry with submitted status
      const { error } = await supabase
        .from('onboarding_progress')
        .insert({
          document_id: documentId,
          user_id: userId,
          form_data: formData,
          status: 'submitted',
          completed_at: now,
          last_saved_at: now,
          notes: notes || null,
        });

      if (error) {
        console.error('Create submission error:', error);
        return { success: false, error: error.message };
      }
    }

    // Get document title for notification
    const { data: document } = await supabase
      .from('onboarding_documents')
      .select('title')
      .eq('id', documentId)
      .single();

    // Create notification for admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true);

    if (admins && admins.length > 0) {
      const { data: staffUser } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      const staffName = staffUser 
        ? `${staffUser.first_name} ${staffUser.last_name}` 
        : 'A staff member';

      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'New Document Submission',
        message: `${staffName} has submitted "${document?.title || 'a document'}" for review.`,
        type: 'document_submission',
        related_resource_type: 'document',
        related_resource_id: documentId,
        is_read: false,
      }));

      await supabase.from('notifications').insert(notifications);
    }

    revalidatePath('/dashboard/onboarding');
    revalidatePath('/admin/submissions');
    return { success: true, message: 'Document submitted for review' };
  } catch (error) {
    console.error('Submit document error:', error);
    return { success: false, error: 'Failed to submit document' };
  }
}

/**
 * Submit HR Record acknowledgment with uploaded PDF and signature
 */
export async function submitHRRecordAcknowledgment({
  recordId,
  userId,
  uploadedFileUrl,
  signatureDataUrl,
  notes = '',
}: {
  recordId: string;
  userId: string;
  uploadedFileUrl: string;
  signatureDataUrl: string;
  notes?: string;
}) {
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Verify the HR record exists and belongs to the user
    const { data: record, error: fetchError } = await supabase
      .from('hr_records')
      .select('id, record_type, user_id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !record) {
      return { success: false, error: 'HR record not found or access denied' };
    }

    // Update the HR record with acknowledgment data
    const { error } = await supabase
      .from('hr_records')
      .update({
        acknowledged_at: now,
        acknowledgment_file_url: uploadedFileUrl,
        signature_url: signatureDataUrl,
        acknowledgment_notes: notes || null,
        updated_at: now,
      })
      .eq('id', recordId);

    if (error) {
      console.error('HR acknowledgment error:', error);
      return { success: false, error: error.message };
    }

    // Notify admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true);

    if (admins && admins.length > 0) {
      const { data: staffUser } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      const staffName = staffUser 
        ? `${staffUser.first_name} ${staffUser.last_name}` 
        : 'A staff member';

      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'HR Record Acknowledged',
        message: `${staffName} has acknowledged and submitted their ${record.record_type.replace(/_/g, ' ')}.`,
        type: 'hr_acknowledgment',
        related_resource_type: 'hr_record',
        related_resource_id: recordId,
        is_read: false,
      }));

      await supabase.from('notifications').insert(notifications);
    }

    revalidatePath('/dashboard/hr-records');
    revalidatePath('/admin/documents');
    return { success: true, message: 'HR record acknowledged successfully' };
  } catch (error) {
    console.error('Submit HR acknowledgment error:', error);
    return { success: false, error: 'Failed to submit acknowledgment' };
  }
}

// Submit filled document for review (legacy - kept for compatibility)
export async function submitFilledDocument(
  documentId: string,
  userId: string,
  formData: Record<string, unknown>,
  signatureDataUrl?: string
) {
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Upload signature if provided
    let signatureUrl: string | null = null;
    if (signatureDataUrl) {
      // For now, store the data URL directly (in production, you'd upload to storage)
      signatureUrl = signatureDataUrl;
    }

    // Check if progress entry exists
    const { data: existingProgress } = await supabase
      .from('onboarding_progress')
      .select('id, status')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (existingProgress) {
      // Don't allow re-submission if already submitted/approved
      if (['approved'].includes(existingProgress.status)) {
        return { success: false, error: 'This document has already been approved' };
      }

      // Update existing progress
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          form_data: formData,
          status: 'submitted',
          completed_at: now,
          last_saved_at: now,
          signature_url: signatureUrl,
        })
        .eq('id', existingProgress.id);

      if (error) {
        console.error('Submit document error:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new progress entry with submitted status
      const { error } = await supabase
        .from('onboarding_progress')
        .insert({
          document_id: documentId,
          user_id: userId,
          form_data: formData,
          status: 'submitted',
          completed_at: now,
          last_saved_at: now,
          signature_url: signatureUrl,
        });

      if (error) {
        console.error('Create submission error:', error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/dashboard/onboarding');
    revalidatePath('/admin/submissions');
    return { success: true, message: 'Document submitted for review' };
  } catch (error) {
    console.error('Submit document error:', error);
    return { success: false, error: 'Failed to submit document' };
  }
}
