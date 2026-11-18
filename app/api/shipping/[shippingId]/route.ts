import prismaDb from '@/lib/prismadb';
import { parseBody, withAuth } from '@/server/http';
import { updateShippingSchema } from '@/server/schemas/order.schema';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

type Params = { shippingId: string };

export const PATCH = withAuth<Params>(
  async ({ request, params }) => {
    const { status } = await parseBody(request, updateShippingSchema);

    const shipping = await prismaDb.shipping.update({
      data: { status },
      where: {
        id: params.shippingId,
      },
    });

    return NextResponse.json(shipping);
  },
  { role: UserRole.ADMIN, label: 'UPDATE_SHIPPING' }
);
