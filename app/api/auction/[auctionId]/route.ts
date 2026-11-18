import { parseBody, withAuth } from '@/server/http';
import { auctionAccessModeSchema, updateAuctionSchema } from '@/server/schemas/auction.schema';
import { auctionService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string };

export const GET = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const mode = auctionAccessModeSchema.parse(request.headers.get('x-access-mode'));
    const auction = await auctionService.getById(authUser, params.auctionId, mode);

    return NextResponse.json(auction);
  },
  { label: 'GET_AUCTION' }
);

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const input = await parseBody(request, updateAuctionSchema);
    const auction = await auctionService.update(authUser, params.auctionId, input);

    return NextResponse.json(auction);
  },
  { label: 'UPDATE_AUCTION' }
);

export const DELETE = withAuth<Params>(
  async ({ params, authUser }) => {
    const auction = await auctionService.delete(authUser, params.auctionId);

    return NextResponse.json(auction);
  },
  { label: 'DELETE_AUCTION' }
);
