import prismaDb from '@/lib/prismadb';
import { withAuth } from '@/server/http';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async () => {
    const categories = await prismaDb.category.findMany();

    return NextResponse.json(categories);
  },
  { label: 'GET_CATEGORIES' }
);
