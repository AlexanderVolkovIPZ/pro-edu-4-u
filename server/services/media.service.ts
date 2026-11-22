import { MediaKind, MediaRecord } from '@/app/_shared/types/media';
import prismaDb from '@/lib/prismadb';
import { PrismaClient } from '@prisma/client';
import { AccessPolicy, accessPolicy, Principal } from '../auth/access-policy';
import { HttpError } from '../http/http-error';
import { ReorderInput } from '../schemas/lot.schema';
import { UploadMediaInput } from '../schemas/media.schema';
import { cloudinaryMediaStorage, MediaResourceType, MediaStorage } from './media-storage';

export type { MediaKind, MediaRecord };

type PositionRange = { gt?: number; gte?: number; lt?: number; lte?: number };

/**
 * The subset of the Prisma delegate API the service needs. Both
 * `prisma.photo` and `prisma.video` satisfy it, which lets one implementation
 * serve both media kinds.
 */
export interface MediaDelegate {
  findFirst(args: { where: { id: string; lotId: string } }): Promise<MediaRecord | null>;
  findMany(args: { where: { lotId: string } }): Promise<MediaRecord[]>;
  create(args: {
    data: { url: string; name: string; position: number; lotId: string; publicId: string };
  }): Promise<MediaRecord>;
  update(args: { where: { id: string; lotId?: string }; data: { position: number } }): Promise<MediaRecord>;
  updateMany(args: {
    where: { lotId: string; position: PositionRange };
    data: { position: { increment: number } | { decrement: number } };
  }): Promise<{ count: number }>;
  delete(args: { where: { id: string; lotId: string } }): Promise<MediaRecord>;
  deleteMany(args: { where: { lotId: string } }): Promise<{ count: number }>;
}

type MediaKindStrategy = {
  label: string;
  resourceType: MediaResourceType;
  delegate: (db: PrismaClient) => MediaDelegate;
};

/** Strategy per media kind: which table to use and how the storage treats the file. */
const MEDIA_KINDS: Record<MediaKind, MediaKindStrategy> = {
  photo: { label: 'Photo', resourceType: 'image', delegate: (db) => db.photo },
  video: { label: 'Video', resourceType: 'video', delegate: (db) => db.video },
};

export type MediaTarget = { kind: MediaKind; auctionId: string; lotId: string };

export class MediaService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly storage: MediaStorage = cloudinaryMediaStorage,
    private readonly policy: AccessPolicy = accessPolicy
  ) {}

  /**
   * Uploads new files and updates positions of already uploaded ones.
   * Returns the newly created records.
   */
  async upload(
    user: Principal,
    { kind, auctionId, lotId }: MediaTarget,
    items: UploadMediaInput
  ): Promise<MediaRecord[]> {
    await this.policy.assertCanManageAuction(user, auctionId);

    const { delegate, resourceType } = MEDIA_KINDS[kind];
    const table = delegate(this.db);

    const created: MediaRecord[] = [];
    for (const { id, file, name, position, isFileUploaded } of items) {
      if (isFileUploaded) {
        await table.update({ where: { id, lotId }, data: { position } });
        continue;
      }

      const stored = await this.storage.upload(file, resourceType);
      created.push(await table.create({ data: { url: stored.url, publicId: stored.publicId, name, position, lotId } }));
    }

    return created;
  }

  async remove(user: Principal, { kind, auctionId, lotId }: MediaTarget, id: string): Promise<MediaRecord> {
    await this.policy.assertCanManageAuction(user, auctionId);

    const { delegate, resourceType, label } = MEDIA_KINDS[kind];
    const table = delegate(this.db);

    const media = await table.findFirst({ where: { id, lotId } });
    if (!media) {
      throw HttpError.notFound(`${label} not found`);
    }

    await this.storage.remove(media.publicId, resourceType);
    const deleted = await table.delete({ where: { id, lotId } });

    // Close the gap left by the removed item.
    await table.updateMany({
      where: { lotId, position: { gt: media.position } },
      data: { position: { decrement: 1 } },
    });

    return deleted;
  }

  async reorder(user: Principal, { kind, auctionId, lotId }: MediaTarget, { id, position }: ReorderInput) {
    await this.policy.assertCanManageAuction(user, auctionId);

    const { delegate, label } = MEDIA_KINDS[kind];
    const table = delegate(this.db);

    const media = await table.findFirst({ where: { id, lotId } });
    if (!media) {
      throw HttpError.notFound(`${label} not found`);
    }

    const isMovingForward = media.position < position;

    const shifted = await table.updateMany({
      where: {
        lotId,
        position: isMovingForward ? { gt: media.position, lte: position } : { gte: position, lt: media.position },
      },
      data: { position: isMovingForward ? { decrement: 1 } : { increment: 1 } },
    });

    await table.update({ where: { id }, data: { position } });

    return shifted;
  }

  /** Removes every stored file of a lot (used before the lot itself is deleted). */
  async removeAllForLot(lotId: string): Promise<void> {
    for (const kind of Object.keys(MEDIA_KINDS) as MediaKind[]) {
      const { delegate, resourceType } = MEDIA_KINDS[kind];
      const items = await delegate(this.db).findMany({ where: { lotId } });

      for (const item of items) {
        await this.storage.remove(item.publicId, resourceType);
      }
    }
  }
}

export const mediaService = new MediaService();
