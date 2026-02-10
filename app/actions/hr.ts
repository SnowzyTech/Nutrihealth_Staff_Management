'use server';

import { createClient } from '@supabase/supabase-js';
import { HRDocumentSchema, PerformanceReviewSchema } from '@/lib/schemas/hr';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getHRDocuments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('hr_documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch HR documents' };
  }
}

export async function uploadHRDocument(input: z.infer<typeof HRDocumentSchema>) {
  try {
    const validatedInput = HRDocumentSchema.parse(input);

    const { data, error } = await supabase
      .from('hr_documents')
      .insert({
        user_id: validatedInput.userId,
        title: validatedInput.title,
        document_type: validatedInput.documentType,
        file_url: validatedInput.fileUrl,
        uploaded_at: validatedInput.uploadedAt,
        uploaded_by: validatedInput.uploadedBy,
        expiry_date: validatedInput.expiryDate,
        is_confidential: validatedInput.isConfidential,
        description: validatedInput.description,
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Document uploaded successfully', data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to upload document' };
  }
}

export async function createPerformanceReview(input: z.infer<typeof PerformanceReviewSchema>) {
  try {
    const validatedInput = PerformanceReviewSchema.parse(input);

    const { data, error } = await supabase
      .from('performance_reviews')
      .insert({
        user_id: validatedInput.userId,
        reviewer_id: validatedInput.reviewerId,
        rating: validatedInput.rating,
        comments: validatedInput.comments,
        review_date: validatedInput.reviewDate,
        next_review_date: validatedInput.nextReviewDate,
        performance_metrics: validatedInput.performanceMetrics,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Performance review created successfully', data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create performance review' };
  }
}

export async function getPerformanceReviews(userId: string) {
  try {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select('*, reviewer:reviewer_id(first_name, last_name)')
      .eq('user_id', userId)
      .order('review_date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch performance reviews' };
  }
}

export async function deleteHRDocument(documentId: string) {
  try {
    const { error } = await supabase
      .from('hr_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Document deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to delete document' };
  }
}
