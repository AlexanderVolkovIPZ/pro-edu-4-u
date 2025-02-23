import getAuthUser from '@/app/actions/get-auth-user';
import { Bid } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const params: Partial<Bid> = {
    ...searchParams,
    isPaid: searchParams.isPaid === 'true' ? true : searchParams.isPaid === 'false' ? false : undefined,
    isWinner: searchParams.isWinner === 'true' ? true : searchParams.isWinner === 'false' ? false : undefined,
  };

  const where = Object.fromEntries(
    Object.entries({
      id: params.id,
      lotId: params.lotId,
      bidderId: params.bidderId,
      amount: params.amount,
      isWinner: params.isWinner,
      isPaid: params.isPaid,
      createdAt: params.createdAt,
    }).filter(([, value]) => value !== undefined)
  );

  try {
    const bids = await prismaDb?.bid.findMany({
      where,
      include: {
        lot: {
          include: {
            photo: true,
            video: true,
            auction: true,
            lotCategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(bids);
  } catch (error) {
    console.error('GET_BIDS_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
