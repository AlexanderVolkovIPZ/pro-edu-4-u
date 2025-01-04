import getAuthUser from '@/app/actions/get-auth-user';
import { deleteFromCloudinary } from '@/app/lib/cloudinary/cloudinary-service';
import prismaDb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

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
        lotDetail: true,
        lotCategory: {
          include: {
            category: true,
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

export async function DELETE(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
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
