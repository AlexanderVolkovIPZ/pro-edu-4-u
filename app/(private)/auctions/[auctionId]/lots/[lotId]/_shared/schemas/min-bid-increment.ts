import { TFunction } from 'i18next';
import { z } from 'zod';

export const createMinBidIncrementSchema = (t: TFunction) =>
  z.object({
    minBidIncrement: z
      .number({
        required_error: t('validation.min_bid_increment_is_required'),
        invalid_type_error: t('validation.min_bid_increment_must_be_a_number'),
      })
      .nullable()
      .refine((value) => value === null || value >= 0, {
        message: t('validation.min_bid_increment_must_be_greater_or_equal_to_zero'),
      }),
  });
