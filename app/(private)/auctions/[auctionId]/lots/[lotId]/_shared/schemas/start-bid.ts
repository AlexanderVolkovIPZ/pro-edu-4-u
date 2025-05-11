import { TFunction } from 'i18next';
import { z } from 'zod';

export const getStartBidSchema = (t: TFunction) =>
  z.object({
    startBid: z
      .number({
        required_error: t('validation.start_bid_is_required'),
        invalid_type_error: t('validation.starting_bid_must_be_a_number'),
      })
      .nullable()
      .refine((value) => value === null || value >= 0, {
        message: t('validation.starting_bid_must_be_greater_or_equal_to_zero'),
      }),
  });
