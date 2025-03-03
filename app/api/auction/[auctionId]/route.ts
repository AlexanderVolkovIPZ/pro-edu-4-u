import getAuthUser from '@/app/actions/get-auth-user';
import prismaDb from '@/lib/prismadb';
import { Auction } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { auctionId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const auction = await prismaDb.auction.findFirst({
      where: {
        id: params.auctionId,
      },
      include: {
        lot: {
          orderBy: {
            position: 'asc',
          },
          include: {
            bid: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            photo: true,
            video: true,
            lotDetail: true,
            lotCategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error('GET_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { auctionId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, isPublished }: Partial<Auction> = body;

    const auction = await prismaDb.auction.update({
      data: {
        title,
        description,
        startDate,
        endDate,
        isPublished,
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

export async function DELETE(request: Request, { params }: { params: { auctionId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    console.log('WE-ARE-HERE');
    const auction = await prismaDb.auction.findFirst({
      where: {
        id: params.auctionId,
      },
    });

    if (!auction) {
      return new NextResponse('Auction not found', { status: 404 });
    }

    const deletedAction = await prismaDb.auction.delete({
      where: {
        id: params.auctionId,
        userAuction: {
          some: {
            userId: authUser.id,
            role: 'OWNER',
          },
        },
      },
    });

    return NextResponse.json(deletedAction);
  } catch (error) {
    console.error('DELETE_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
