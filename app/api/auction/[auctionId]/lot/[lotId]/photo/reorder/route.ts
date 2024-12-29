import getAuthUser from '@/app/actions/get-auth-user';
import { ReorderFileType } from '@/app/types';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body: ReorderFileType = await request.json();
  const { id, position } = body;

  try {
    const photo = await prismaDb?.photo.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!photo) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    const isNewPositionHigher = photo.position < position;

    const updatedPhotos = await prismaDb?.photo.updateMany({
      where: {
        lotId: params.lotId,
        position: {
          ...(isNewPositionHigher ? { gt: photo.position, lte: position } : { gte: position, lt: photo.position }),
        },
      },
      data: {
        position: isNewPositionHigher ? { decrement: 1 } : { increment: 1 },
      },
    });

    await prismaDb?.photo.update({
      where: {
        id,
      },
      data: {
        position,
      },
    });

    return NextResponse.json(updatedPhotos);
  } catch (error) {
    console.error('REORDER_PHOTO_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
