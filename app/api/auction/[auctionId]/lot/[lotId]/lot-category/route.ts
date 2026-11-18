import { parseBody, withAuth } from '@/server/http';
import { lotCategoriesSchema } from '@/server/schemas/lot.schema';
import { lotService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const { categoryIds } = await parseBody(request, lotCategoriesSchema);
    const categories = await lotService.setCategories(authUser, params.auctionId, params.lotId, categoryIds);

    return NextResponse.json(categories, { status: 201 });
  },
  { label: 'CREATE_LOT_CATEGORY' }
);

export const GET = withAuth<Params>(
  async ({ params }) => {
    const categories = await lotService.getCategories(params.lotId);

    return NextResponse.json(categories);
  },
  { label: 'GET_LOT_CATEGORY' }
);
