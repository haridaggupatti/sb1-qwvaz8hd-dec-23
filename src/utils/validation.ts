import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const userSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(['admin', 'user']),
  isActive: z.boolean(),
  department: z.string().min(1, 'Department is required'),
  permissions: z.array(z.string()),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});