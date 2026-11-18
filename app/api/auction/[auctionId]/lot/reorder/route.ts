import { parseBody, withAuth } from '@/server/http';
import { reorderSchema } from '@/server/schemas/lot.schema';
import { lotService } from '@/server/services';
import { NextResponse } from 'next/server';

type Params = { auctionId: string };

export const PATCH = withAuth<Params>(
  async ({ request, params, authUser }) => {
    const input = await parseBody(request, reorderSchema);
    const result = await lotService.reorder(authUser, params.auctionId, input);

    return NextResponse.json(result);
  },
  { label: 'REORDER_LOT' }
);
