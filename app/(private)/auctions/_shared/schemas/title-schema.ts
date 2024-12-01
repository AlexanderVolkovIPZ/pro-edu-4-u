import { z } from 'zod';

export const titleSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters long.' })
    .max(30, { message: 'Title should be no more than 30 symbols' }),
});
