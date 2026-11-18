import { withAuth } from '@/server/http';
import { categoryService } from '@/server/services';
import { NextResponse } from 'next/server';

export const GET = withAuth(
  async () => {
    const categories = await categoryService.list();

    return NextResponse.json(categories);
  },
  { label: 'GET_CATEGORIES' }
);
