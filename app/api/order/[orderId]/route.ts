import { withAuth } from '@/server/http';
import { orderService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { orderId: string };

export const GET = withAuth<Params>(
  async ({ params, authUser }) => {
    const order = await orderService.getById(authUser, params.orderId);

    return NextResponse.json(order);
  },
  { label: 'GET_ORDER' }
);
