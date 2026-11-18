import prismaDb from '@/lib/prismadb';
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AccessPolicy, accessPolicy, Principal } from '../auth/access-policy';
import { HttpError } from '../http/http-error';
import { CreateLotInput, lotDetailsSchema, ReorderInput, UpdateLotInput } from '../schemas/lot.schema';
import { mediaService, MediaService } from './media.service';

type LotDetailsInput = z.infer<typeof lotDetailsSchema>;

const lotInclude = {
  photo: { orderBy: { position: 'asc' } },
  video: { orderBy: { position: 'asc' } },
  lotDetail: true,
  lotCategory: { include: { category: true } },
} satisfies Prisma.LotInclude;

export class LotService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly policy: AccessPolicy = accessPolicy,
    private readonly media: MediaService = mediaService
  ) {}

  async list(auctionId: string) {
    return this.db.lot.findMany({ where: { auctionId }, include: lotInclude });
  }

  /**
   * Owners and administrators see every lot (including drafts); everybody
   * else only sees lots of published and approved auctions.
   */
  async getById(user: Principal, auctionId: string, lotId: string) {
    const isManager = await this.policy.canManageAuction(user, auctionId);

    const lot = await this.db.lot.findFirst({
      where: {
        id: lotId,
        auctionId,
        ...(!isManager && { auction: { isPublished: true, isApproved: true } }),
      },
      include: {
        ...lotInclude,
        bid: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    return lot;
  }

  async create(user: Principal, auctionId: string, { title }: CreateLotInput) {
    await this.policy.assertCanManageAuction(user, auctionId);

    const auction = await this.db.auction.findUnique({
      where: { id: auctionId },
      include: { lot: { select: { position: true } } },
    });

    if (!auction) {
      throw HttpError.notFound('Auction not found');
    }

    const position = auction.lot.reduce((max, lot) => Math.max(max, lot.position), 0) + 1;

    return this.db.lot.create({ data: { title, auctionId, position } });
  }

  async update(user: Principal, auctionId: string, lotId: string, data: UpdateLotInput) {
    await this.policy.assertCanManageAuction(user, auctionId);

    return this.db.lot.update({ where: { id: lotId, auctionId }, data });
  }

  async delete(user: Principal, auctionId: string, lotId: string) {
    await this.policy.assertCanManageAuction(user, auctionId);

    await this.media.removeAllForLot(lotId);

    return this.db.lot.delete({
      where: { id: lotId, auctionId },
      include: { photo: true, video: true },
    });
  }

  /** Moves a lot to a new position and shifts the lots in between. */
  async reorder(user: Principal, auctionId: string, { id, position: newPosition }: ReorderInput) {
    await this.policy.assertCanManageAuction(user, auctionId);

    const lot = await this.db.lot.findUnique({ where: { id, auctionId } });
    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    const isMovingForward = newPosition > lot.position;
    const affected = await this.db.lot.findMany({
      where: {
        auctionId,
        position: isMovingForward ? { gt: lot.position, lte: newPosition } : { gte: newPosition, lt: lot.position },
      },
    });

    await this.db.$transaction([
      ...affected.map((item) =>
        this.db.lot.update({
          where: { id: item.id },
          data: { position: isMovingForward ? item.position - 1 : item.position + 1 },
        })
      ),
      this.db.lot.update({ where: { id }, data: { position: newPosition } }),
    ]);

    return { lot, ...affected };
  }

  async getCategories(lotId: string) {
    return this.db.lotCategory.findMany({ where: { lotId } });
  }

  async setCategories(user: Principal, auctionId: string, lotId: string, categoryIds: string[]) {
    await this.policy.assertCanManageAuction(user, auctionId);

    await this.db.lotCategory.deleteMany({ where: { lotId } });

    if (!categoryIds.length) return [];

    await this.db.lotCategory.createMany({
      data: categoryIds.map((categoryId) => ({ lotId, categoryId })),
    });

    return this.getCategories(lotId);
  }

  async getDetails(lotId: string) {
    return this.db.lotDetail.findMany({ where: { lotId } });
  }

  async setDetails(user: Principal, auctionId: string, lotId: string, details: LotDetailsInput) {
    await this.policy.assertCanManageAuction(user, auctionId);

    await this.db.lotDetail.deleteMany({ where: { lotId } });

    if (!details.length) return [];

    await this.db.lotDetail.createMany({
      data: details.map((detail) => ({ lotId, ...detail })),
    });

    return this.getDetails(lotId);
  }
}

export const lotService = new LotService();
