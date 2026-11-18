import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction } from '@/server/auth/policies';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { reorderSchema } from '@/server/schemas/lot.schema';
import { NextResponse } from 'next/server';

type Params = { auctionId: string };

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { id, position: newLotPosition } = await parseBody(request, reorderSchema);

    const lot = await prismaDb.lot.findUnique({
      where: {
        id,
        auctionId: params.auctionId,
      },
    });

    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    const oldLotPosition = lot.position;
    const isHigherPosition = newLotPosition > oldLotPosition;
    const positionConfig = isHigherPosition
      ? {
          gt: oldLotPosition,
          lte: newLotPosition,
        }
      : {
          gte: newLotPosition,
          lt: oldLotPosition,
        };

    const lots = await prismaDb.lot.findMany({
      where: {
        position: positionConfig,
        auctionId: params.auctionId,
      },
    });

    await prismaDb.$transaction(async (prisma) => {
      await Promise.all(
        lots.map((lot) =>
          prisma.lot.update({
            data: {
              position: isHigherPosition ? lot.position - 1 : lot.position + 1,
            },
            where: { id: lot.id },
          })
        )
      );

      await prisma.lot.update({
        data: { position: newLotPosition },
        where: { id },
      });
    });

    return NextResponse.json({ lot, ...lots });
  },
  { label: 'REORDER_LOT' }
);
