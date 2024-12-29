import getAuthUser from '@/app/actions/get-auth-user';
import { CreateLotCategoriesType } from '@/app/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { lotId, categoryIds }: CreateLotCategoriesType = await request.json();

  if (!lotId) {
    return new NextResponse('LotId is required and cannot be empty', { status: 400 });
  }

  try {
    await prismaDb?.lotCategory.deleteMany({
      where: {
        lotId,
      },
    });

    if (!categoryIds.length) return NextResponse.json([]);

    const data = categoryIds.map((categoryId) => ({
      lotId,
      categoryId,
    }));

    await prismaDb?.lotCategory.createMany({
      data,
    });

    const categories = await prismaDb?.lotCategory.findMany({
      where: {
        lotId,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('CREATE_LOT_CATEGORY_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const lotId = url.searchParams.get('lotId');

  try {
    if (!lotId) {
      return new NextResponse('LotId is required and cannot be empty', { status: 400 });
    }

    const lotCategories = await prismaDb?.lotCategory.findMany({
      where: {
        lotId,
      },
    });

    return NextResponse.json(lotCategories);
  } catch (error) {
    console.error('GET_LOT_CATEGORY_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
