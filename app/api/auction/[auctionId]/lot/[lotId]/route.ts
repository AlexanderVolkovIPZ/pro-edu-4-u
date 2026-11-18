import { parseBody, withAuth } from '@/server/http';
import { updateLotSchema } from '@/server/schemas/lot.schema';
import { lotService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const GET = withAuth<Params>(
  async ({ params, authUser }) => {
    const lot = await lotService.getById(authUser, params.auctionId, params.lotId);

    return NextResponse.json(lot);
  },
  { label: 'GET_LOT' }
);

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const input = await parseBody(request, updateLotSchema);
    const lot = await lotService.update(authUser, params.auctionId, params.lotId, input);

    return NextResponse.json(lot);
  },
  { label: 'UPDATE_LOT' }
);

export const DELETE = withAuth<Params>(
  async ({ params, authUser }) => {
    const lot = await lotService.delete(authUser, params.auctionId, params.lotId);

    return NextResponse.json(lot);
  },
  { label: 'DELETE_LOT' }
);
