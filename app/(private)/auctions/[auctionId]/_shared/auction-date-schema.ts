import { z } from 'zod';

const CURRENT_DATE = new Date();
export const auctionDateSchema = z.object({
  startDate: z
    .date()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        return date > CURRENT_DATE;
      },
      {
        message: 'Start date must be in the future',
      }
    ),
  endDate: z
    .date()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        return date > CURRENT_DATE;
      },
      {
        message: 'End date must be in the future',
      }
    ),
});

export type AuctionDateSchema = z.infer<typeof auctionDateSchema>;
