import { ShippingStatus } from '@prisma/client';
import { z } from 'zod';
import { paginationQuery } from './common';

export const listOrdersQuerySchema = paginationQuery.extend({
  tab: z.enum(['all-orders', 'my-orders', 'sent-orders']).optional(),
});

export const updateShippingSchema = z.object({
  status: z.nativeEnum(ShippingStatus),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
