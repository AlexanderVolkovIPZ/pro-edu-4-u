import { parseBody, withAuth } from '@/server/http';
import { updateShippingSchema } from '@/server/schemas/order.schema';
import { orderService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { shippingId: string };

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const { status } = await parseBody(request, updateShippingSchema);
    const shipping = await orderService.updateStatus(authUser, params.shippingId, status);

    return NextResponse.json(shipping);
  },
  { label: 'UPDATE_SHIPPING' }
);
