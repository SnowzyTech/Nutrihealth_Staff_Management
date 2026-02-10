import { z } from 'zod';

export const OnboardingDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  description: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL'),
  documentType: z.enum(['employment_contract', 'handbook', 'tax_form', 'insurance', 'other']),
  isRequired: z.boolean().default(true),
  dueDate: z.date(),
  category: z.string().min(1, 'Category is required'),
});

export const DocumentAcknowledgmentSchema = z.object({
  documentId: z.string().uuid(),
  acknowledgedAt: z.date(),
  signature: z.string().min(10, 'Signature is required'),
  notes: z.string().optional(),
});

export type OnboardingDocument = z.infer<typeof OnboardingDocumentSchema>;
export type DocumentAcknowledgment = z.infer<typeof DocumentAcknowledgmentSchema>;
