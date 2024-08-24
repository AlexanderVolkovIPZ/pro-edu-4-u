import z from 'zod';

export const schema = z.object({
  email: z.string().email({ message: 'Invalid email format' }).default(''),
  password: z
    .string()
    .min(6, 'Password must be at least 8 characters long')
    .regex(/(?=.*[a-z])/, 'Must include at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must include at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Must contain at least one number')
    .default(''),
});
