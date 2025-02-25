import getAuthUser from '@/app/actions/get-auth-user';
import { NextResponse } from 'next/server';
import prismaDb from '@/lib/prismadb';

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const categories = await prismaDb.category.findMany();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET_CATEGORIES_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
