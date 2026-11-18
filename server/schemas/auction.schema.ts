import { z } from 'zod';
import { booleanQuery, jsonStringArrayQuery } from './common';

export const createAuctionSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const updateAuctionSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(10_000).nullable().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isPublished: z.boolean().optional(),
  /** Only administrators may approve auctions; the handler enforces that. */
  isApproved: z.boolean().optional(),
});

export const auctionAccessModeSchema = z.enum(['view', 'edit']).catch('view');

export const listAuctionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
  loadForCurrentUser: booleanQuery,
  minLotPrice: z.coerce.number().min(0).optional(),
  maxLotPrice: z.coerce.number().min(0).optional(),
  categories: jsonStringArrayQuery,
});

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;
export type ListAuctionsQuery = z.infer<typeof listAuctionsQuerySchema>;
