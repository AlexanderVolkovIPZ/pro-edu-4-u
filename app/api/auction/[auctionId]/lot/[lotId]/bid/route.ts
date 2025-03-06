import getAuthUser from '@/app/actions/get-auth-user';
import { Bid } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { lotId } = params;

    if (!lotId) {
      return new NextResponse('LotId is required and cannot be empty', { status: 400 });
    }

    const data: Bid = await request.json();

    const bid = await prismaDb?.bid.create({
      data,
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('CREATE_BID_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { bidId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { bidId } = params;

    if (!bidId) {
      return new NextResponse('BidId is required and cannot be empty', { status: 400 });
    }

    const bid = await prismaDb?.bid.findFirst({
      where: {
        id: bidId,
      },
    });

    return NextResponse.json(bid);
  } catch (error) {
    console.error('GET_BID_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
