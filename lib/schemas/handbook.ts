import { z } from 'zod';

export const HandbookCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().int().default(0),
});

export const HandbookContentSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1, 'Content title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export type HandbookCategory = z.infer<typeof HandbookCategorySchema>;
export type HandbookContent = z.infer<typeof HandbookContentSchema>;
