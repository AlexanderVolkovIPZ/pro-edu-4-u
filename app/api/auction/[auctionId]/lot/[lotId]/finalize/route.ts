import { BID_SILENCE_MS } from '@/app/_shared/domain/bidding';
import { getLotSchedule } from '@/app/_shared/domain/lot-schedule';
import prismaDb from '@/lib/prismadb';
import { HttpError, withAuth } from '@/server/http';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

/**
 * Finalizes bidding for a lot: the highest bid becomes the winner and the lot
 * is marked as sold. The client only *asks* for finalization; whether bidding
 * is actually over is decided here, from the auction schedule and the time of
 * the last bid. The operation is idempotent.
 */
export const POST = withAuth<Params>(
  async ({ params }) => {
    const lot = await prismaDb.lot.findFirst({
      where: { id: params.lotId, auctionId: params.auctionId },
      include: {
        auction: { include: { _count: { select: { lot: true } } } },
        bid: { orderBy: { amount: 'desc' }, take: 1 },
      },
    });

    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    if (lot.isSold) {
      return NextResponse.json(lot);
    }

    const [topBid] = lot.bid;
    if (!topBid) {
      throw HttpError.conflict('There are no bids for this lot');
    }

    const { auction } = lot;
    if (!auction.startDate || !auction.endDate) {
      throw HttpError.conflict('Auction has no schedule');
    }

    const now = Date.now();
    const schedule = getLotSchedule({
      auctionStartDate: auction.startDate,
      auctionEndDate: auction.endDate,
      position: lot.position,
      lotsCount: auction._count.lot,
    });

    const isSilenceOver = now - +topBid.createdAt >= BID_SILENCE_MS;
    const isSlotOver = now >= schedule.endsAt;

    if (!isSilenceOver && !isSlotOver) {
      throw HttpError.conflict('Bidding is still in progress');
    }

    const [, updatedLot] = await prismaDb.$transaction([
      prismaDb.bid.update({ where: { id: topBid.id }, data: { isWinner: true } }),
      prismaDb.lot.update({ where: { id: lot.id }, data: { isSold: true } }),
    ]);

    return NextResponse.json(updatedLot);
  },
  { label: 'FINALIZE_LOT' }
);
