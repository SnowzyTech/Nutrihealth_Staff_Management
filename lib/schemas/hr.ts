import { z } from 'zod';

export const HRDocumentSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1, 'Document title is required'),
  documentType: z.enum(['salary_slip', 'contract', 'evaluation', 'certification', 'performance_review', 'other']),
  fileUrl: z.string().url('Invalid file URL'),
  uploadedAt: z.date(),
  uploadedBy: z.string().uuid(),
  expiryDate: z.date().optional(),
  isConfidential: z.boolean().default(false),
  description: z.string().optional(),
});

export const PerformanceReviewSchema = z.object({
  userId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comments: z.string().min(10, 'Comments must be at least 10 characters'),
  reviewDate: z.date(),
  nextReviewDate: z.date(),
  performanceMetrics: z.record(z.number()).optional(),
});

export type HRDocument = z.infer<typeof HRDocumentSchema>;
export type PerformanceReview = z.infer<typeof PerformanceReviewSchema>;
