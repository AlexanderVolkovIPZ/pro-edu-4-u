import { z } from 'zod';

export const minBidIncrementSchema = z.object({
  minBidIncrement: z
    .number({
      required_error: 'Min bid increment is required',
      invalid_type_error: 'Min bid increment must be a number',
    })
    .nullable()
    .refine((value) => value === null || value >= 0, {
      message: 'Min bid increment must be greater than or equal to 0',
    }),
});
