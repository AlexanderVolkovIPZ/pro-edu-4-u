import { parseQuery, withAuth } from '@/server/http';
import { listBidsQuerySchema } from '@/server/schemas/bid.schema';
import { bidService } from '@/server/services';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async ({ request, authUser }) => {
    const query = parseQuery(request, listBidsQuerySchema);
    const bids = await bidService.list(authUser, query);

    return NextResponse.json(bids);
  },
  { label: 'GET_BIDS' }
);
