import getAuthUser from '@/app/actions/get-auth-user';
import prismaDb from '@/lib/prismadb';
import { Auction, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return new NextResponse('Title is required and cannot be empty', { status: 400 });
    }

    const auction = await prismaDb.auction.create({
      data: {
        title,
      },
    });

    await prismaDb.userAuction.create({
      data: {
        userId: authUser.id,
        auctionId: auction.id,
      },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error('CREATE_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const params: Partial<Auction> & {
      page?: number;
      limit?: number;
      loadForCurrentUser?: boolean;
      minLotPrice?: number;
      maxLotPrice?: number;
      categories?: string;
    } = {
      ...searchParams,

      isPublished:
        searchParams.isPublished === 'true' ? true : searchParams.isPublished === 'false' ? false : undefined,
      isApproved: searchParams.isApproved === 'true' ? true : searchParams.isApproved === 'false' ? false : undefined,
    };
    const {
      title,
      description,
      startDate,
      endDate,
      createdAt,
      updatedAt,
      isPublished,
      isApproved,
      page,
      limit,
      loadForCurrentUser,
      minLotPrice,
      maxLotPrice,
    } = params;

    const categoriesName: string[] | undefined = params.categories ? JSON.parse(params.categories) : [];

    const userAuctions = await prismaDb.userAuction.findMany({
      where:
        loadForCurrentUser && authUser.role !== UserRole.ADMIN
          ? {
              userId: authUser.id,
            }
          : {},
    });

    const filters = {
      ...(title && { title }),
      ...(description && { description }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(createdAt && { createdAt }),
      ...(updatedAt && { updatedAt }),
      ...(typeof isPublished === 'boolean' && { isPublished }),
      ...(typeof isApproved === 'boolean' && { isApproved }),
      id: {
        in: userAuctions.map((userAuction) => userAuction.auctionId),
      },
    };

    const lotConditions = [];

    if (minLotPrice || maxLotPrice) {
      lotConditions.push({
        startBid: {
          ...(minLotPrice && { gte: Number(minLotPrice) }),
          ...(maxLotPrice && { lte: Number(maxLotPrice) }),
        },
      });
    }

    if (categoriesName && categoriesName.length) {
      lotConditions.push({
        lotCategory: {
          some: {
            category: {
              name: {
                in: categoriesName,
              },
            },
          },
        },
      });
    }

    const combinedLotFilters = lotConditions.length
      ? {
          lot: {
            some: {
              AND: lotConditions,
            },
          },
        }
      : {};

    const whereCondition = {
      AND: [filters, combinedLotFilters],
    };

    const totalCount = await prismaDb.auction.count({ where: { ...whereCondition } });
    const totalPages = Math.ceil(totalCount / (limit ? Number(limit) : 5));

    const auctions = await prismaDb.auction.findMany({
      where: {
        ...whereCondition,
      },
      include: {
        lot: {
          include: {
            photo: true,
            video: true,
            lotCategory: {
              include: {
                category: true,
              },
            },
            bid: {
              select: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            _count: {
              select: {
                bid: true,
              },
            },
          },
        },
        _count: {
          select: {
            lot: true,
          },
        },
        userAuction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: Number(limit) }),
      ...(page && limit && { skip: (Number(page) - 1) * Number(limit) }),
    });

    const maxLotPriceExistedResult = await prismaDb.lot.aggregate({
      where: {
        auction: {
          ...filters,
        },
      },
      _max: {
        startBid: true,
      },
    });

    const minLotPriceExistedResult = await prismaDb.lot.aggregate({
      where: {
        auction: {
          ...filters,
        },
      },
      _min: {
        startBid: true,
      },
    });

    const lotCategoriesExisted = await prismaDb.category.findMany({
      where: {
        lotCategory: {
          some: {
            lot: {
              auction: {
                isPublished: true,
              },
            },
          },
        },
      },
      select: {
        name: true,
      },
    });

    const lotCategoriesExistedNames = lotCategoriesExisted.map((category) => category.name);

    return NextResponse.json({
      auctions,
      total: totalCount,
      totalPages,
      page: page || 1,
      limit: limit || totalCount,
      maxLotPriceExisted: maxLotPriceExistedResult._max.startBid || 0,
      minLotPriceExisted: minLotPriceExistedResult._min.startBid || 0,
      lotCategoriesExistedNames,
    });
  } catch (error) {
    console.error('GET_AUCTIONS_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
