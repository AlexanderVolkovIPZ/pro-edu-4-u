import { parseBody, withAuth } from '@/server/http';
import { lotDetailsSchema } from '@/server/schemas/lot.schema';
import { lotService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const details = await parseBody(request, lotDetailsSchema);
    const lotDetails = await lotService.setDetails(authUser, params.auctionId, params.lotId, details);

    return NextResponse.json(lotDetails, { status: 201 });
  },
  { label: 'CREATE_LOT_DETAIL' }
);

export const GET = withAuth<Params>(
  async ({ params }) => {
    const lotDetails = await lotService.getDetails(params.lotId);

    return NextResponse.json(lotDetails);
  },
  { label: 'GET_LOT_DETAIL' }
);
