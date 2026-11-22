import { BidType } from '@prisma/client';
import { z } from 'zod';
import { objectId } from './common';

export const shippingInfoSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(30),
  city: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(200),
  postalCode: z.string().trim().min(1).max(20),
});

export const createPaymentSchema = z.object({
  lots: z.array(objectId).min(1).max(20),
  shippingInfo: shippingInfoSchema,
  bidType: z.nativeEnum(BidType),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ShippingInfo = z.infer<typeof shippingInfoSchema>;
