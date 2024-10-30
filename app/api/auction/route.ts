import getAuthUser from '@/app/actions/get-auth-user';
import prismaDb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title) {
    return new NextResponse('Title is required and cannot be empty', { status: 400 });
  }

  try {
    const auction = await prismaDb.auction.create({
      data: {
        title,
        creatorId: authUser.id,
      },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error('CREATE_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
