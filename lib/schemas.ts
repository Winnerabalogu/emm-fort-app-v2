import { z } from 'zod';

export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referral: z.string().optional(),
});