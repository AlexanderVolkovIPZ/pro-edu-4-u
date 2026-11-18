import prismaDb from '@/lib/prismadb';
import { isAdmin } from '@/server/auth/policies';
import { HttpError, withAuth } from '@/server/http';
import { AuctionRole } from '@prisma/client';
import { NextResponse } from 'next/server';

type Params = { orderId: string };

export const GET = withAuth<Params>(
  async ({ params, authUser }) => {
    const order = await prismaDb.shipping.findUnique({
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
            auction: {
              select: {
                userAuction: {
                  select: {
                    userId: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw HttpError.notFound('Order not found');
    }

    const isCustomer = authUser.id === order.userId;
    const isLotOwner = order.lot.auction.userAuction.some(
      ({ userId, role }) => userId === authUser.id && role === AuctionRole.OWNER
    );

    if (!isAdmin(authUser) && !isCustomer && !isLotOwner) {
      throw HttpError.forbidden();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { auction, ...lot } = order.lot;

    return NextResponse.json({ ...order, lot });
  },
  { label: 'GET_ORDER' }
);
