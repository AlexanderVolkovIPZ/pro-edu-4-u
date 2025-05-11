import { TFunction } from 'i18next';
import { z } from 'zod';

export const createByNowBidSchema = (t: TFunction) =>
  z.object({
    buyNowBid: z
      .number({
        required_error: t('validation.buy_now_bid_is_required'),
        invalid_type_error: t('validation.buy_now_bid_must_be_a_number'),
      })
      .min(0)
      .nullish(),
  });
