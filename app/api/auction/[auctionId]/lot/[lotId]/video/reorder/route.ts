import getAuthUser from '@/app/actions/get-auth-user';
import { ReorderFileType } from '@/app/types';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function PATCH(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body: ReorderFileType = await request.json();
    const { id, position } = body;

    const video = await prismaDb.video.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }

    const isNewPositionHigher = video.position < position;

    const updatedVideos = await prismaDb.video.updateMany({
      where: {
        lotId: params.lotId,
        position: {
          ...(isNewPositionHigher ? { gt: video.position, lte: position } : { gte: position, lt: video.position }),
        },
      },
      data: {
        position: isNewPositionHigher ? { decrement: 1 } : { increment: 1 },
      },
    });

    await prismaDb.video.update({
      where: {
        id,
      },
      data: {
        position,
      },
    });

    return NextResponse.json(updatedVideos);
  } catch (error) {
    console.error('REORDER_VIDEO_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
