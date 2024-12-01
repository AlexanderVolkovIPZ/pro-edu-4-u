import { z } from 'zod';

export const startBidSchema = z.object({
  startBid: z
    .number({
      required_error: 'Starting bid is required',
      invalid_type_error: 'Starting bid must be a number',
    })
    .nullable()
    .refine((value) => value === null || value >= 0, {
      message: 'Starting bid must be greater than or equal to 0',
    }),
});
