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

    const media = await prismaDb.photo.findFirst({
      where: {
        id,
        lotId: params.lotId,
      },
    });

    if (!media) {
      throw HttpError.notFound('Photo not found');
    }

    const isNewPositionHigher = media.position < position;

    const updated = await prismaDb.photo.updateMany({
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

    await prismaDb.photo.update({
      where: {
        id,
      },
      data: {
        position,
      },
    });

    return NextResponse.json(updated);
  },
  { label: 'REORDER_PHOTO' }
);
