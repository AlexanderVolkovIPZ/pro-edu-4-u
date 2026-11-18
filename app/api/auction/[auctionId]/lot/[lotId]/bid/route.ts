import prismaDb from '@/lib/prismadb';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { placeBidSchema } from '@/server/schemas/bid.schema';
import { BidType } from '@prisma/client';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

/**
 * Places a bid on behalf of the current user. The bidder, type and winner /
 * payment flags are controlled by the server and cannot be supplied by the
 * client.
 */
export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const { amount } = await parseBody(request, placeBidSchema);

    const lot = await prismaDb.lot.findFirst({
      where: { id: params.lotId, auctionId: params.auctionId },
      select: { id: true, isSold: true },
    });

    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    if (lot.isSold) {
      throw HttpError.conflict('Lot is already sold');
    }

    const bid = await prismaDb.bid.create({
      data: {
        lotId: lot.id,
        bidderId: authUser.id,
        amount,
        type: BidType.BIDDING,
      },
    });

    return NextResponse.json(bid, { status: 201 });
  },
  { label: 'CREATE_BID' }
);
