import prismaDb from '@/lib/prismadb';
import { assertCanManageAuction } from '@/server/auth/policies';
import { parseBody, withAuth } from '@/server/http';
import { lotCategoriesSchema } from '@/server/schemas/lot.schema';
import { NextResponse } from 'next/server';

type Params = { auctionId: string; lotId: string };

export const POST = withAuth<Params>(
  async ({ request, params, authUser }) => {
    await assertCanManageAuction(authUser, params.auctionId);

    const { lotId } = params;
    const { categoryIds } = await parseBody(request, lotCategoriesSchema);

    await prismaDb.lotCategory.deleteMany({
      where: {
        lotId,
      },
    });

    if (!categoryIds.length) return NextResponse.json([]);

    await prismaDb.lotCategory.createMany({
      data: categoryIds.map((categoryId) => ({ lotId, categoryId })),
    });

    const categories = await prismaDb.lotCategory.findMany({
      where: {
        lotId,
      },
    });

    return NextResponse.json(categories, { status: 201 });
  },
  { label: 'CREATE_LOT_CATEGORY' }
);

export const GET = withAuth<Params>(
  async ({ params }) => {
    const lotCategories = await prismaDb.lotCategory.findMany({
      where: {
        lotId: params.lotId,
      },
    });

    return NextResponse.json(lotCategories);
  },
  { label: 'GET_LOT_CATEGORY' }
);
