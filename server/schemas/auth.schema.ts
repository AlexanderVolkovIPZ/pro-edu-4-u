import { z } from 'zod';

const password = z
  .string()
  .min(6)
  .max(128)
  .regex(/(?=.*[a-z])/, 'Password must contain a lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain an uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain a number');

export const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  password,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: password,
});

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1),
});
