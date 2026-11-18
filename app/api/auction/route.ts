import { parseBody, parseQuery, withAuth } from '@/server/http';
import { createAuctionSchema, listAuctionsQuerySchema } from '@/server/schemas/auction.schema';
import { auctionService } from '@/server/services';
import { NextResponse } from 'next/server';

export const POST = withAuth(
  async ({ request, authUser }) => {
    const input = await parseBody(request, createAuctionSchema);
    const auction = await auctionService.create(authUser, input);

    return NextResponse.json(auction);
  },
  { label: 'CREATE_AUCTION' }
);

export const GET = withAuth(
  async ({ request, authUser }) => {
    const query = parseQuery(request, listAuctionsQuerySchema);
    const page = await auctionService.list(authUser, query);

    return NextResponse.json(page);
  },
  { label: 'GET_AUCTIONS' }
);
