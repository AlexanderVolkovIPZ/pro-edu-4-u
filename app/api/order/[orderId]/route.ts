import getAuthUser from '@/app/actions/get-auth-user';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const shipping = await prismaDb?.shipping.findFirst({
      where: {
        id: params.orderId,
      },
    });

    if (!shipping) {
      return new NextResponse('Order not found', { status: 404 });
    }

    const lot = await prismaDb?.lot.findFirst({
      where: {
        id: shipping.lotId,
      },
      select: {
        auction: {
          select: {
            userAuction: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!lot) {
      return new NextResponse('Lot not found', { status: 404 });
    }

    const isAuthUserLotCustomer = authUser.id === shipping.userId;
    const isAuthUserLotOwner = lot.auction.userAuction.some(
      ({ userId }) => userId === authUser.id && authUser.role === UserRole.ADMIN
    );

    if (!isAuthUserLotCustomer && !isAuthUserLotOwner) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const order = await prismaDb?.shipping.findFirst({
      where: {
        id: params.orderId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        lot: {
          select: {
            id: true,
            title: true,
            photo: true,
            bid: {
              where: {
                isWinner: true,
              },
              take: 1,
            },
            auctionId: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('GET_ORDER_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
