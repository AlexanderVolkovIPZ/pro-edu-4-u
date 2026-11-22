import { NextResponse } from 'next/server';
import { reorderSchema } from '../../schemas/lot.schema';
import { deleteMediaSchema, uploadMediaSchema } from '../../schemas/media.schema';
import { MediaKind, mediaService } from '../../services/media.service';
import { parseBody } from '../validation';
import { withAuth } from '../with-auth';

type Params = { auctionId: string; lotId: string };

/**
 * Builds the route handlers for one media kind. Photo and video routes are
 * identical apart from the kind, so they share this factory.
 */
export function createMediaHandlers(kind: MediaKind) {
  const label = kind.toUpperCase();

  const POST = withAuth<Params>(
    async ({ request, params, authUser }) => {
      const items = await parseBody(request, uploadMediaSchema);
      const uploaded = await mediaService.upload(authUser, { kind, ...params }, items);

      return NextResponse.json(uploaded);
    },
    { label: `CREATE_${label}` }
  );

  const DELETE = withAuth<Params>(
    async ({ request, params, authUser }) => {
      const { id } = await parseBody(request, deleteMediaSchema);
      const deleted = await mediaService.remove(authUser, { kind, ...params }, id);

      return NextResponse.json(deleted);
    },
    { label: `DELETE_${label}` }
  );

  const PATCH_REORDER = withAuth<Params>(
    async ({ request, params, authUser }) => {
      const input = await parseBody(request, reorderSchema);
      const result = await mediaService.reorder(authUser, { kind, ...params }, input);

      return NextResponse.json(result);
    },
    { label: `REORDER_${label}` }
  );

  return { POST, DELETE, PATCH_REORDER };
}
