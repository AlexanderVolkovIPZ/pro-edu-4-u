import { parseBody, withAuth } from '@/server/http';
import { createLotSchema } from '@/server/schemas/lot.schema';
import { lotService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const input = await parseBody(request, createLotSchema);
    const lot = await lotService.create(authUser, params.auctionId, input);

    return NextResponse.json(lot);
  },
  { label: 'CREATE_LOT' }
);

export const GET = withAuth<Params>(
  async ({ params }) => {
    const lots = await lotService.list(params.auctionId);

    return NextResponse.json(lots);
  },
  { label: 'GET_LOTS' }
);
