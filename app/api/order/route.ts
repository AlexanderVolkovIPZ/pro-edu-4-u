import prismaDb from '@/lib/prismadb';
import { isAdmin } from '@/server/auth/policies';
import { parseQuery, withAuth } from '@/server/http';
import { listOrdersQuerySchema } from '@/server/schemas/order.schema';
import { AuctionRole, Prisma, ShippingStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async ({ request, authUser }) => {
    const { page, limit, tab } = parseQuery(request, listOrdersQuerySchema);

    let where: Prisma.ShippingWhereInput | undefined;
    if (tab === 'sent-orders') {
      where = {
        lot: {
          auction: {
            userAuction: {
              some: {
                userId: authUser.id,
                role: AuctionRole.OWNER,
              },
            },
          },
        },
        status: {
          not: ShippingStatus.DELIVERED,
        },
      };
    } else if (tab === 'my-orders') {
      where = {
        userId: authUser.id,
      };
    } else {
      // 'all-orders' (default tab): everything for administrators, own purchases otherwise
      where = isAdmin(authUser) ? undefined : { userId: authUser.id };
    }

    const totalCount = await prismaDb.shipping.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await prismaDb.shipping.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        city: true,
        address: true,
        postalCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
          },
        },
        lot: {
          select: {
            id: true,
            title: true,
            auction: {
              select: {
                id: true,
                userAuction: {
                  select: {
                    role: true,
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return NextResponse.json({
      orders,
      total: totalCount,
      totalPages,
      page,
      limit,
    });
  },
  { label: 'GET_ORDERS' }
);
