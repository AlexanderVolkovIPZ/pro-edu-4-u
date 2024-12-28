import getAuthUser from '@/app/actions/get-auth-user';
import prismaDb from '@/lib/prismadb';
import { Auction } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title) {
    return new NextResponse('Title is required and cannot be empty', { status: 400 });
  }

  try {
    const auction = await prismaDb.auction.create({
      data: {
        title,
      },
    });

    await prismaDb.userAuction.create({
      data: {
        userId: authUser.id,
        auctionId: auction.id,
        isOwner: true,
      },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error('CREATE_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const params: Partial<Auction> = {
    ...searchParams,
    isPublished: searchParams.isPublished === 'true' ? true : searchParams.isPublished === 'false' ? false : undefined,
  };
  const { id, title, description, startDate, endDate, createdAt, updatedAt, isPublished } = params;

  try {
    const auctions = await prismaDb.auction.findMany({
      where: {
        ...(id && { id }),
        ...(title && { title }),
        ...(description && { description }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(createdAt && { createdAt }),
        ...(updatedAt && { updatedAt }),
        ...(typeof isPublished === 'boolean' && { isPublished }),
      },
      include: {
        lot: {
          include: {
            photo: true,
          },
        },
        userAuction: true,
        auctionCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('GET_AUCTIONS_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
