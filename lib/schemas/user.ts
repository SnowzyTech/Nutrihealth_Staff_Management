import { z } from 'zod';

export const UserProfileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  startDate: z.date().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
});

export const StaffMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.date(),
  role: z.enum(['staff', 'manager', 'admin']).default('staff'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type StaffMember = z.infer<typeof StaffMemberSchema>;
