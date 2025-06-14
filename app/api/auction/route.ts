import getAuthUser from '@/app/actions/get-auth-user';
import prismaDb from '@/lib/prismadb';
import { Auction, Prisma, UserRole } from '@prisma/client';
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
      page = 1,
      limit = 8,
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

    if (categoriesName?.length) {
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

    const include = {
      lot: {
        include: {
          photo: {
            orderBy: {
              position: 'asc',
            },
          },
          video: {
            orderBy: {
              position: 'asc',
            },
          },
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
    } as const;

    const now = new Date();
    const pageSize = Number(limit);
    const currentPage = Number(page);
    const skip = (currentPage - 1) * pageSize;

    const mergedConditions = Object.assign({}, ...lotConditions);

    const auctionsCondition = [
      //ACTIVE AUCTIONS
      {
        where: {
          ...filters,
          startDate: { lte: now },
          endDate: { gt: now },
          isPublished: true,
          isApproved: true,
          lot: { some: { AND: [{ isSold: false }, mergedConditions] } },
        },
      },

      // UPCOMING AUCTIONS
      {
        where: {
          ...filters,
          startDate: { gt: now },
          endDate: { gt: now },
          isPublished: true,
          isApproved: true,
          lot: { some: { AND: [{ isSold: false }, mergedConditions] } },
        },
      },

      // ENDED AUCTIONS
      {
        where: {
          ...filters,
          isPublished: true,
          isApproved: true,
          OR: [{ lot: { every: { isSold: true } } }, { endDate: { lt: now } }],
          ...(lotConditions.length > 0 && {
            lot: {
              some: {
                AND: mergedConditions,
              },
            },
          }),
        },
      },

      // DRAFT AUCTIONS
      {
        where: {
          ...filters,
          OR: [
            { isPublished: false, isApproved: false },
            { isPublished: true, isApproved: false },
          ],
        },
      },
    ];

    const [activeCount, upcomingCount, endedCount, draftCount] = await Promise.all(
      auctionsCondition.map(async (condition) => {
        return await prismaDb.auction.count({
          where: condition.where as Prisma.AuctionWhereInput,
        });
      })
    );

    let totalCount = activeCount + upcomingCount + endedCount;
    if (loadForCurrentUser) {
      totalCount += draftCount;
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    const auctionsToDisplay: Auction[] = [];
    let remaining = pageSize;
    let currentSkip = skip;

    if (loadForCurrentUser && remaining > 0 && currentSkip < draftCount) {
      const draftAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[3].where,
        include,
        orderBy: {
          startDate: 'asc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...draftAuctions);
      remaining -= draftAuctions.length;
      currentSkip = Math.max(0, currentSkip - draftCount);
    } else {
      currentSkip = Math.max(0, currentSkip - draftCount);
    }

    if (remaining > 0 && currentSkip < activeCount) {
      const activeAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[0].where,
        include,
        orderBy: {
          startDate: 'asc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...activeAuctions);
      remaining -= activeAuctions.length;
      currentSkip = Math.max(0, currentSkip - activeCount);
    } else {
      currentSkip = Math.max(0, currentSkip - activeCount);
    }

    if (remaining > 0 && currentSkip < upcomingCount) {
      const upcomingAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[1].where,
        include,
        orderBy: {
          startDate: 'asc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...upcomingAuctions);
      remaining -= upcomingAuctions.length;
      currentSkip = Math.max(0, currentSkip - upcomingCount);
    } else {
      currentSkip = Math.max(0, currentSkip - upcomingCount);
    }

    if (remaining > 0 && currentSkip < endedCount) {
      const endedAuctions = await prismaDb.auction.findMany({
        where: auctionsCondition[2].where,
        include,
        orderBy: {
          endDate: 'desc',
        },
        take: remaining,
        skip: currentSkip,
      });

      auctionsToDisplay.push(...endedAuctions);
    }

    const [maxLotPriceExistedResult, minLotPriceExistedResult] = await Promise.all([
      prismaDb.lot.aggregate({
        where: {
          auction: {
            ...filters,
          },
        },
        _max: {
          startBid: true,
        },
      }),
      prismaDb.lot.aggregate({
        where: {
          auction: {
            ...filters,
          },
        },
        _min: {
          startBid: true,
        },
      }),
    ]);

    return NextResponse.json({
      auctions: auctionsToDisplay,
      total: totalCount,
      totalPages,
      page: currentPage,
      limit: pageSize,
      maxLotPriceExisted: maxLotPriceExistedResult._max.startBid || 0,
      minLotPriceExisted: minLotPriceExistedResult._min.startBid || 0,
      lotCategoriesExistedNames: await getLotCategoriesNames(),
    });
  } catch (error) {
    console.error('GET_AUCTIONS_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

async function getLotCategoriesNames(): Promise<string[]> {
  const categories = await prismaDb.category.findMany({
    where: {
      lotCategory: {
        some: {
          lot: {
            auction: { isPublished: true, isApproved: true },
          },
        },
      },
    },
    select: { name: true },
  });

  return categories.map((category) => category.name);
}
