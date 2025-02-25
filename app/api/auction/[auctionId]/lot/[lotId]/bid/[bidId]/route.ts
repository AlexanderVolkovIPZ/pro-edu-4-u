import getAuthUser from '@/app/actions/get-auth-user';
import { Bid } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { auctionId: string; lotId: string; bidId: string } }
) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body: Omit<Bid, 'id' | 'createdAt'> = await request.json();
  const { amount, bidderId, isWinner, lotId } = body;

  try {
    const bid = await prismaDb?.bid.update({
      data: {
        amount,
        bidderId,
        isWinner,
        lotId,
      },
      where: {
        id: params.bidId,
        lotId: params.lotId,
      },
    });

    return NextResponse.json(bid);
  } catch (error) {
    console.error('UPDATE_BID_ID_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
