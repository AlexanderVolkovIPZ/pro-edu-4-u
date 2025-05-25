import getAuthUser from '@/app/actions/get-auth-user';
import { AuctionRole, ShippingStatus, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAuthUserAdmin = authUser.role === UserRole.ADMIN;

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const params: { page?: number; limit?: number; loadForCurrentUser?: boolean; tab?: string } = {
      ...searchParams,
    };
    const { page, limit, tab } = params;

    let totalCount;
    let where;
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
      totalCount = await prismaDb?.shipping.count({
        where,
      });
    } else if (tab === 'my-orders') {
      where = {
        userId: authUser.id,
      };

      totalCount = await prismaDb?.shipping.count({
        where,
      });
    } else {
      const where = !isAuthUserAdmin ? { userId: authUser.id } : undefined;

      totalCount = await prismaDb?.shipping.count({
        where,
      });
    }

    totalCount ??= 0;

    const totalPages = Math.ceil(totalCount / (limit ? Number(limit) : 5));

    const orders = await prismaDb?.shipping.findMany({
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
      ...(limit && { take: Number(limit) }),
      ...(page && limit && { skip: (Number(page) - 1) * Number(limit) }),
    });

    return NextResponse.json({
      orders,
      total: totalCount,
      totalPages,
      page: page || 1,
      limit: limit || totalCount,
    });
  } catch (error) {
    console.error('GET_ORDER_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
