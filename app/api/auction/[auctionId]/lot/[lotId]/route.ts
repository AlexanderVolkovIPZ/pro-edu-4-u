import getAuthUser from '@/app/actions/get-auth-user';
import { deleteFromCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import prismaDb from '@/lib/prismadb';
import { AuctionRole, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const filters =
      authUser.role === UserRole.ADMIN
        ? { id: params.lotId, auctionId: params.auctionId }
        : {
            id: params.lotId,
            auctionId: params.auctionId,
            auction: {
              userAuction: {
                some: {
                  userId: authUser.id,
                  role: AuctionRole.OWNER,
                },
              },
            },
          };

    const lot = await prismaDb.lot.findFirst({
      where: {
        ...filters,
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
        lotDetail: true,
        lotCategory: {
          include: {
            category: true,
          },
        },
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
      },
    });

    if (!lot) {
      return new NextResponse('Lot not found', { status: 404 });
    }

    return NextResponse.json(lot);
  } catch (error) {
    console.error('GET_LOT_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
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
    const { title, position, description, startBid, buyNowBid, minBidIncrement, isSold } = body;

    const lot = await prismaDb.lot.update({
      data: {
        title,
        position,
        description,
        startBid,
        buyNowBid,
        minBidIncrement,
        isSold,
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

export async function DELETE(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
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

    const photos = await prismaDb.photo.findMany({ where: { lotId: params.lotId } });
    const videos = await prismaDb.video.findMany({ where: { lotId: params.lotId } });

    for (const photo of photos) {
      await deleteFromCloudinary(photo.publicId);
    }

    for (const video of videos) {
      await deleteFromCloudinary(video.publicId);
    }

    const lot = await prismaDb.lot.delete({
      where: {
        id: params.lotId,
        auctionId: params.auctionId,
      },
      include: {
        photo: true,
        video: true,
      },
    });

    return NextResponse.json(lot);
  } catch (error) {
    console.error('DELETE_LOT_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
