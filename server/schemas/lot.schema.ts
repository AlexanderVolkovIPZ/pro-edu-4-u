import { z } from 'zod';
import { objectId } from './common';

export const createLotSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

/**
 * Fields the owner may edit. `isSold` is deliberately absent: it is set only
 * by the server when a lot is finalized or paid for.
 */
const money = z.number().finite().min(0);

export const updateLotSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(10_000).nullable().optional(),
  startBid: money.nullable().optional(),
  buyNowBid: money.nullable().optional(),
  minBidIncrement: money.nullable().optional(),
});

export const reorderSchema = z.object({
  id: objectId,
  position: z.number().int().min(1),
});

export const lotCategoriesSchema = z.object({
  categoryIds: z.array(objectId).max(50),
});

export const lotDetailsSchema = z
  .array(
    z.object({
      fieldName: z.string().trim().min(1).max(100),
      fieldValue: z.string().trim().min(1).max(500),
      iconName: z.string().trim().min(1).max(100),
    })
  )
  .max(50);

export type CreateLotInput = z.infer<typeof createLotSchema>;
export type UpdateLotInput = z.infer<typeof updateLotSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
