import getAuthUser from '@/app/actions/get-auth-user';
import { CreateLotDetailsType } from '@/app/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { lotId } = params;

    if (!lotId) {
      return new NextResponse('LotId is required and cannot be empty', { status: 400 });
    }

    const details: CreateLotDetailsType = await request.json();

    const data = details.map((detail) => ({
      lotId,
      ...detail,
    }));

    await prismaDb?.lotDetail.deleteMany({ where: { lotId } });

    if (!data.length) return NextResponse.json([]);

    await prismaDb?.lotDetail.createMany({
      data,
    });

    const lotDetails = await prismaDb?.lotDetail.findMany({
      where: {
        lotId,
      },
    });

    return NextResponse.json(lotDetails, { status: 201 });
  } catch (error) {
    console.error('CREATE_LOT_DETAIL_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { auctionId: string; lotId: string } }) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { lotId } = params;

  if (!lotId) {
    return new NextResponse('LotId is required and cannot be empty', { status: 400 });
  }

  try {
    const lotCategories = await prismaDb?.lotCategory.findFirst({
      where: {
        lotId,
      },
    });

    return NextResponse.json(lotCategories);
  } catch (error) {
    console.error('GET_LOT_DETAIL_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
