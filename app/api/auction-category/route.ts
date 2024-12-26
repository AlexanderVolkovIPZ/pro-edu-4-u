import getAuthUser from '@/app/actions/get-auth-user';
import { CreateAuctionCategoriesType } from '@/app/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { auctionId, categoryIds }: CreateAuctionCategoriesType = await request.json();

  if (!auctionId) {
    return new NextResponse('AuctionId is required and cannot be empty', { status: 400 });
  }

  try {
    await prismaDb?.auctionCategory.deleteMany({
      where: {
        auctionId: auctionId,
      },
    });

    if (!categoryIds.length) return NextResponse.json([]);

    const data = categoryIds.map((categoryId) => ({
      auctionId,
      categoryId,
    }));

    await prismaDb?.auctionCategory.createMany({
      data,
    });

    const categories = await prismaDb?.auctionCategory.findMany({
      where: {
        auctionId,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('CREATE_AUCTION_CATEGORY_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const auctionId = url.searchParams.get('auctionId');

  try {
    if (!auctionId) {
      return new NextResponse('AuctionId is required and cannot be empty', { status: 400 });
    }

    const auctionCategories = await prismaDb?.auctionCategory.findMany({
      where: {
        auctionId,
      },
    });

    return NextResponse.json(auctionCategories);
  } catch (error) {
    console.error('GET_AUCTION_CATEGORY_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
