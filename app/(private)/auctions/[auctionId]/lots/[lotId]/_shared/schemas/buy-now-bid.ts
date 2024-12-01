import { z } from 'zod';

export const buyNowBidSchema = z.object({
  buyNowBid: z
    .number({
      required_error: 'Buy now bid is required',
      invalid_type_error: 'Buy now bid must be a number',
    })
    .nullable()
    .refine((value) => value === null || value >= 0, {
      message: 'Buy now bid must be greater than or equal to 0',
    }),
});
