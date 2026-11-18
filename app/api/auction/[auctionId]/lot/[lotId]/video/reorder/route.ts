import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction } from '@/server/auth/policies';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { reorderSchema } from '@/server/schemas/lot.schema';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { id, position } = await parseBody(request, reorderSchema);

    const media = await prismaDb.video.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!media) {
      throw HttpError.notFound('Video not found');
    }

    const isNewPositionHigher = media.position < position;

    const updated = await prismaDb.video.updateMany({
      where: {
        lotId: params.lotId,
        position: {
          ...(isNewPositionHigher ? { gt: media.position, lte: position } : { gte: position, lt: media.position }),
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

    return NextResponse.json(updated);
  },
  { label: 'REORDER_VIDEO' }
);
