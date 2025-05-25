import { TFunction } from 'i18next';
import { z } from 'zod';

const CURRENT_DATE = new Date();

export const getAuctionDateSchema = (t: TFunction) =>
  z.object({
    startDate: z
      .date()
      .optional()
      .refine(
        (date) => {
          if (!date) return true;
          return date > CURRENT_DATE;
        },
        {
          message: t('validation.start_bid_must_be_in_the_future'),
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
          message: t('validation.end_date_must_be_in_the_future'),
        }
      ),
  });
