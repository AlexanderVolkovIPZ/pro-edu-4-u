import { parseBody, withAuth } from '@/server/http';
import { placeBidSchema } from '@/server/schemas/bid.schema';
import { bidService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const { amount } = await parseBody(request, placeBidSchema);
    const bid = await bidService.place(authUser, { ...params, amount });

    return NextResponse.json(bid, { status: 201 });
  },
  { label: 'CREATE_BID' }
);
