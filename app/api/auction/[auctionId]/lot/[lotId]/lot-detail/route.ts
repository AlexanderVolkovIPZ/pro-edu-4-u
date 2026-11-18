import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction } from '@/server/auth/policies';
import { parseBody, withAuth } from '@/server/http';
import { lotDetailsSchema } from '@/server/schemas/lot.schema';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { lotId } = params;
    const details = await parseBody(request, lotDetailsSchema);

    await prismaDb.lotDetail.deleteMany({ where: { lotId } });

    if (!details.length) return NextResponse.json([]);

    await prismaDb.lotDetail.createMany({
      data: details.map((detail) => ({ lotId, ...detail })),
    });

    const lotDetails = await prismaDb.lotDetail.findMany({
      where: {
        lotId,
      },
    });

    return NextResponse.json(lotDetails, { status: 201 });
  },
  { label: 'CREATE_LOT_DETAIL' }
);

export const GET = withAuth<Params>(
  async ({ params }) => {
    const lotDetails = await prismaDb.lotDetail.findMany({
      where: {
        lotId: params.lotId,
      },
    });

    return NextResponse.json(lotDetails);
  },
  { label: 'GET_LOT_DETAIL' }
);
