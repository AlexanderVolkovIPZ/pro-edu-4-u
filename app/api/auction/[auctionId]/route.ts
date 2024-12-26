import getAuthUser from '@/app/actions/get-auth-user';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function GET(request: Request, { params }: { params: { auctionId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const auction = await prismaDb.auction.findFirst({
      where: {
        id: params.auctionId,
      },
      include: {
        lot: {
          orderBy: {
            position: 'asc',
          },
        },
        auctionCategory: true,
      },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error('GET_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { auctionId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { title, description, startDate, endDate } = body;

  try {
    const auction = await prismaDb.auction.update({
      data: {
        title,
        description,
        startDate,
        endDate,
      },
      where: {
        id: params.auctionId,
      },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error('UPDATE_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
