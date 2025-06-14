import getAuthUser from '@/app/actions/get-auth-user';
import { AuctionRole, UserAuction } from '@prisma/client';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const params: Partial<UserAuction> = {
      ...searchParams,
    };
    const { id, auctionId, userId, createdAt } = params;
    const role = searchParams.role as AuctionRole | undefined;

    const auctions = await prismaDb.userAuction.findMany({
      where: {
        ...(id && { id }),
        ...(auctionId && { auctionId }),
        ...(userId && { userId }),
        ...(createdAt && { createdAt }),
        ...(role && { role }),
      },
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('GET_USER_AUCTIONS_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
