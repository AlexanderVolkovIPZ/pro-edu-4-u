import { parseQuery, withAuth } from '@/server/http';
import { listOrdersQuerySchema } from '@/server/schemas/order.schema';
import { orderService } from '@/server/services';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async ({ request, authUser }) => {
    const query = parseQuery(request, listOrdersQuerySchema);
    const page = await orderService.list(authUser, query);

    return NextResponse.json(page);
  },
  { label: 'GET_ORDERS' }
);
