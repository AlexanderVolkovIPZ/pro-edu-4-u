import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction } from '@/server/auth/policies';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { createLotSchema } from '@/server/schemas/lot.schema';
import { NextResponse } from 'next/server';

type Params = { auctionId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { title } = await parseBody(request, createLotSchema);

    const auction = await prismaDb.auction.findUnique({
      where: { id: params.auctionId },
      include: { lot: { select: { position: true } } },
    });

    if (!auction) {
      throw HttpError.notFound('Auction not found');
    }

    const lotPosition = auction.lot.reduce((max, lot) => Math.max(max, lot.position), 0) + 1;

    const lot = await prismaDb.lot.create({
      data: {
        title,
        auctionId: auction.id,
        position: lotPosition,
      },
    });

    return NextResponse.json(lot);
  },
  { label: 'CREATE_LOT' }
);

export const GET = withAuth<Params>(
  async ({ params }) => {
    const lots = await prismaDb.lot.findMany({
      where: {
        auctionId: params.auctionId,
      },
      include: {
        photo: {
          orderBy: {
            position: 'asc',
          },
        },
        video: {
          orderBy: {
            position: 'asc',
          },
        },
        lotDetail: true,
        lotCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(lots);
  },
  { label: 'GET_LOTS' }
);
