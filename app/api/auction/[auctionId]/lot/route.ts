import getAuthUser from '@/app/actions/get-auth-user';
import prismaDb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { auctionId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title) {
    return new NextResponse('Title is required and cannot be empty', { status: 400 });
  }

  const auctionId = params.auctionId;
  if (!auctionId) {
    return new NextResponse('Auction is required and cannot be empty', { status: 400 });
  }

  try {
    const auction = await prismaDb.auction.findFirst({
      where: {
        id: auctionId,
      },
      include: {
        lot: true,
      },
    });

    if (!auction) {
      return new NextResponse('Auction not found', { status: 404 });
    }

    const lotPosition = auction.lot?.length
      ? auction.lot.reduce((max, lot) => (lot.position > max.position ? lot : max)).position + 1
      : 1;

    const lot = await prismaDb.lot.create({
      data: {
        title,
        auctionId: auction.id,
        position: lotPosition,
      },
    });

    return NextResponse.json(lot);
  } catch (error) {
    console.error('CREATE_LOT_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
