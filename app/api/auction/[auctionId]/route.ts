import getAuthUser from '@/app/actions/get-auth-user';
import prismaDb from '@/lib/prismadb';
import { Auction, AuctionRole, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { auctionId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const filters = authUser.role === UserRole.ADMIN ? {} : { userId: authUser.id, role: AuctionRole.OWNER };

    const auction = await prismaDb.auction.findFirst({
      where: {
        id: params.auctionId,
        userAuction: {
          some: {
            ...filters,
          },
        },
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

    if (!auction) {
      return new NextResponse('Auction not found', { status: 404 });
    }

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

    const userAuction = await prismaDb.userAuction.findFirst({
      where: {
        userId: authUser.id,
        auctionId: params.auctionId,
        role: AuctionRole.OWNER,
      },
    });

    const isAuthUserAdmin = authUser.role === UserRole.ADMIN;
    if (!userAuction && !isAuthUserAdmin) {
      return new NextResponse('Auction not found', { status: 404 });
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

    const auction = await prismaDb.auction.findFirst({
      where: {
        id: params.auctionId,
      },
    });

    if (!auction) {
      return new NextResponse('Auction not found', { status: 404 });
    }

    const userAuction = await prismaDb.userAuction.findFirst({
      where: {
        userId: authUser.id,
        auctionId: params.auctionId,
        role: AuctionRole.OWNER,
      },
    });

    const isAuthUserAdmin = authUser.role === UserRole.ADMIN;
    if (!userAuction && !isAuthUserAdmin) {
      return new NextResponse('Auction not found', { status: 404 });
    }

    const deletedAction = await prismaDb.auction.delete({
      where: {
        id: params.auctionId,
      },
    });

    return NextResponse.json(deletedAction);
  } catch (error) {
    console.error('DELETE_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
