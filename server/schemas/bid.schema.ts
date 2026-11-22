import { z } from 'zod';
import { booleanQuery, jsonStringArrayQuery, objectId, positiveMoney } from './common';

/** A bid is placed with an amount only; the bidder is the current user. */
export const placeBidSchema = z.object({
  amount: positiveMoney,
});

export const lotRefSchema = z.object({
  auctionId: objectId,
  lotId: objectId,
});

/** Payload of the `newBid` socket event. */
export const socketBidSchema = lotRefSchema.extend({
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
