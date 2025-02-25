import getAuthUser from '@/app/actions/get-auth-user';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function PATCH(request: Request, { params }: { params: { auctionId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { id, position: newLotPosition } = body;

  try {
    const lot = await prismaDb?.lot.findUnique({
      where: {
        id,
        auctionId: params.auctionId,
      },
    });

    if (!lot) {
      return;
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

    const lots =
      (await prismaDb.lot.findMany({
        where: {
          position: {
            ...positionConfig,
          },
          auctionId: params.auctionId,
        },
      })) || [];

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
  } catch (error) {
    console.error('REORDER_LOT_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
