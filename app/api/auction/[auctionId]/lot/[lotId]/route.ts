import getAuthUser from '@/app/actions/get-auth-user';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function GET(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const lot = await prismaDb.lot.findFirst({
      where: {
        id: params.lotId,
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
      },
    });

    return NextResponse.json(lot);
  } catch (error) {
    console.error('GET_LOT_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { title, position, description, startBid, buyNowBid, minBidIncrement } = body;

  try {
    const lot = await prismaDb.lot.update({
      data: {
        title,
        position,
        description,
        startBid,
        buyNowBid,
        minBidIncrement,
      },
      where: {
        id: params.lotId,
        auctionId: params.auctionId,
      },
    });

    return NextResponse.json(lot);
  } catch (error) {
    console.error('UPDATE_LOT_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
