import { AccessPolicy } from '@/server/auth/access-policy';
import { MediaStorage } from '@/server/services/media-storage';
import { MediaDelegate, MediaService } from '@/server/services/media.service';
import { PrismaClient, UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const admin = { id: 'admin-id', role: UserRole.ADMIN };
const target = { auctionId: 'auction-id', lotId: 'lot-id' } as const;

const record = (id: string, position: number) => ({
  id,
  name: `${id}.jpg`,
  pseudonym: null,
  url: `https://cdn/${id}`,
  publicId: `public-${id}`,
  position,
  lotId: target.lotId,
});

function makeDelegate(): { [K in keyof MediaDelegate]: ReturnType<typeof vi.fn> } {
  return {
    findFirst: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn(async ({ data }) => ({ id: 'new', pseudonym: null, ...data })),
    update: vi.fn(),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  };
}

describe('MediaService', () => {
  let photo: ReturnType<typeof makeDelegate>;
  let video: ReturnType<typeof makeDelegate>;
  let storage: { [K in keyof MediaStorage]: ReturnType<typeof vi.fn> };
  let service: MediaService;

  beforeEach(() => {
    photo = makeDelegate();
    video = makeDelegate();
    storage = {
      upload: vi.fn(async (file: string) => ({ url: `https://cdn/${file}`, publicId: `public-${file}` })),
      remove: vi.fn(),
    };
    service = new MediaService({ photo, video } as unknown as PrismaClient, storage, new AccessPolicy());
  });

  it('uses the photo table and image storage for photos, the video table and video storage for videos', async () => {
    const items = [{ id: 'tmp', name: 'a.jpg', position: 1, file: 'a', isFileUploaded: false }];

    await service.upload(admin, { kind: 'photo', ...target }, items);
    expect(storage.upload).toHaveBeenCalledWith('a', 'image');
    expect(photo.create).toHaveBeenCalled();
    expect(video.create).not.toHaveBeenCalled();

    await service.upload(admin, { kind: 'video', ...target }, items);
    expect(storage.upload).toHaveBeenLastCalledWith('a', 'video');
    expect(video.create).toHaveBeenCalled();
  });

  it('only updates positions of files that were already uploaded', async () => {
    await service.upload(admin, { kind: 'photo', ...target }, [
      { id: 'existing', name: 'a.jpg', position: 3, file: '', isFileUploaded: true },
    ]);

    expect(photo.update).toHaveBeenCalledWith({
      where: { id: 'existing', lotId: target.lotId },
      data: { position: 3 },
    });
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('removes the stored file and closes the position gap on delete', async () => {
    photo.findFirst.mockResolvedValue(record('p1', 2));
    photo.delete.mockResolvedValue(record('p1', 2));

    await service.remove(admin, { kind: 'photo', ...target }, 'p1');

    expect(storage.remove).toHaveBeenCalledWith('public-p1', 'image');
    expect(photo.updateMany).toHaveBeenCalledWith({
      where: { lotId: target.lotId, position: { gt: 2 } },
      data: { position: { decrement: 1 } },
    });
  });

  it('shifts the items between the old and the new position on reorder', async () => {
    photo.findFirst.mockResolvedValue(record('p1', 1));

    await service.reorder(admin, { kind: 'photo', ...target }, { id: 'p1', position: 3 });

    expect(photo.updateMany).toHaveBeenCalledWith({
      where: { lotId: target.lotId, position: { gt: 1, lte: 3 } },
      data: { position: { decrement: 1 } },
    });
    expect(photo.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { position: 3 } });
  });

  it('rejects users who do not manage the auction', async () => {
    const policy = new AccessPolicy({
      userAuction: { findFirst: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient);
    const restricted = new MediaService({ photo, video } as unknown as PrismaClient, storage, policy);

    await expect(
      restricted.remove({ id: 'stranger', role: UserRole.USER }, { kind: 'photo', ...target }, 'p1')
    ).rejects.toMatchObject({ status: 403 });
    expect(storage.remove).not.toHaveBeenCalled();
  });
});
