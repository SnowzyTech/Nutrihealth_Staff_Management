import { z } from 'zod';

export const TrainingModuleSchema = z.object({
  title: z.string().min(1, 'Training title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  isMandatory: z.boolean().default(true),
  durationMinutes: z.number().positive('Duration must be positive'),
  contentUrl: z.string().url('Invalid content URL'),
  expiryMonths: z.number().positive().optional(),
});

export const TrainingProgressSchema = z.object({
  moduleId: z.string().uuid(),
  userId: z.string().uuid(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  score: z.number().min(0).max(100).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'expired']),
  certificateUrl: z.string().url().optional(),
});

export type TrainingModule = z.infer<typeof TrainingModuleSchema>;
export type TrainingProgress = z.infer<typeof TrainingProgressSchema>;
