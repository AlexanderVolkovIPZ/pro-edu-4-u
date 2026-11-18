import { withAuth } from '@/server/http';
import { bidService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

/** The client only asks to close bidding; the service decides whether it is over. */
export const POST = withAuth<Params>(
  async ({ params }) => {
    const lot = await bidService.finalizeLot(params);

    return NextResponse.json(lot);
  },
  { label: 'FINALIZE_LOT' }
);
