import { z } from 'zod';
import { booleanQuery, jsonStringArrayQuery, objectId, positiveMoney } from './common';

/** A bid is placed with an amount only; the bidder is the current user. */
export const placeBidSchema = z.object({
  amount: positiveMoney,
});

export const listBidsQuerySchema = z.object({
  lotId: objectId.optional(),
  lotsId: jsonStringArrayQuery,
  bidderId: objectId.optional(),
  isWinner: booleanQuery,
  isPaid: booleanQuery,
});

export type PlaceBidInput = z.infer<typeof placeBidSchema>;
export type ListBidsQuery = z.infer<typeof listBidsQuerySchema>;
