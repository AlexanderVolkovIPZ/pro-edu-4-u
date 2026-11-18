import { AuthUser } from '@/app/_shared/types/auth-user';
import prismaDb from '@/lib/prismadb';
import { AuctionRole, Prisma, PrismaClient } from '@prisma/client';
import { AccessPolicy, accessPolicy, Principal } from '../auth/access-policy';
import { HttpError } from '../http/http-error';
import { CreateAuctionInput, ListAuctionsQuery, UpdateAuctionInput } from '../schemas/auction.schema';
import { buildAuctionSections, buildLotConditions } from './auction-list/sections';
import { paginateSections } from './auction-list/paginate-sections';

export type AuctionAccessMode = 'view' | 'edit';

const lotMediaInclude = {
  photo: { orderBy: { position: 'asc' } },
  video: { orderBy: { position: 'asc' } },
} satisfies Prisma.LotInclude;

const auctionDetailsInclude = {
  lot: {
    orderBy: { position: 'asc' },
    include: {
      ...lotMediaInclude,
      bid: { include: { user: { select: { id: true, name: true } } } },
      lotDetail: true,
      lotCategory: { include: { category: true } },
    },
  },
} satisfies Prisma.AuctionInclude;

const auctionListInclude = {
  lot: {
    include: {
      ...lotMediaInclude,
      lotCategory: { include: { category: true } },
      bid: { select: { user: { select: { id: true } } } },
      _count: { select: { bid: true } },
    },
  },
  _count: { select: { lot: true } },
  userAuction: true,
} satisfies Prisma.AuctionInclude;

export class AuctionService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly policy: AccessPolicy = accessPolicy
  ) {}

  async create(owner: Principal, { title }: CreateAuctionInput) {
    return this.db.auction.create({
      data: {
        title,
        userAuction: {
          create: { userId: owner.id, role: AuctionRole.OWNER },
        },
      },
    });
  }

  /** In `edit` mode only owners (or administrators) can load the auction. */
  async getById(user: Principal, auctionId: string, mode: AuctionAccessMode = 'view') {
    const ownershipFilter: Prisma.AuctionWhereInput =
      mode === 'edit' && !this.policy.isAdmin(user)
        ? { userAuction: { some: { userId: user.id, role: AuctionRole.OWNER } } }
        : {};

    const auction = await this.db.auction.findFirst({
      where: { id: auctionId, ...ownershipFilter },
      include: auctionDetailsInclude,
    });

    if (!auction) {
      throw HttpError.notFound('Auction not found');
    }

    return auction;
  }

  async update(user: Principal, auctionId: string, { isApproved, ...data }: UpdateAuctionInput) {
    await this.policy.assertCanManageAuction(user, auctionId);

    // Only administrators approve auctions; owners can publish them for review.
    const approvalChange = this.policy.isAdmin(user) ? isApproved : undefined;

    if (approvalChange) {
      const auction = await this.db.auction.findUnique({ where: { id: auctionId } });

      if (!auction) {
        throw HttpError.notFound('Auction not found');
      }

      if (!auction.startDate || auction.startDate < new Date()) {
        throw HttpError.badRequest('Start date cannot be in the past');
      }
    }

    return this.db.auction.update({
      where: { id: auctionId },
      data: {
        ...data,
        ...(approvalChange !== undefined && { isApproved: approvalChange }),
      },
    });
  }

  async delete(user: Principal, auctionId: string) {
    await this.policy.assertCanManageAuction(user, auctionId);

    return this.db.auction.delete({ where: { id: auctionId } });
  }

  /**
   * Catalogue of auctions, paginated across sections (drafts of the current
   * user, active, upcoming, ended) and enriched with filter metadata.
   */
  async list(user: AuthUser, query: ListAuctionsQuery) {
    const { page, limit, loadForCurrentUser = false, ...lotFilter } = query;

    const base = await this.visibleAuctionsFilter(user, loadForCurrentUser);
    const lotConditions = buildLotConditions(lotFilter);
    const sections = buildAuctionSections({ base, lotConditions, includeDrafts: loadForCurrentUser });

    const [result, priceBounds, categoryNames] = await Promise.all([
      paginateSections(
        sections.map(({ where, orderBy }) => ({
          count: () => this.db.auction.count({ where }),
          fetch: (skip: number, take: number) =>
            this.db.auction.findMany({ where, orderBy, skip, take, include: auctionListInclude }),
        })),
        page,
        limit
      ),
      this.getLotPriceBounds(base),
      this.getUsedCategoryNames(),
    ]);

    return {
      auctions: result.items,
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      ...priceBounds,
      lotCategoriesExistedNames: categoryNames,
    };
  }

  private async visibleAuctionsFilter(user: Principal, onlyOwn: boolean): Promise<Prisma.AuctionWhereInput> {
    if (!onlyOwn || this.policy.isAdmin(user)) {
      return {};
    }

    const owned = await this.db.userAuction.findMany({
      where: { userId: user.id },
      select: { auctionId: true },
    });

    return { id: { in: owned.map(({ auctionId }) => auctionId) } };
  }

  private async getLotPriceBounds(auction: Prisma.AuctionWhereInput) {
    const bounds = await this.db.lot.aggregate({
      where: { auction },
      _min: { startBid: true },
      _max: { startBid: true },
    });

    return {
      minLotPriceExisted: bounds._min.startBid ?? 0,
      maxLotPriceExisted: bounds._max.startBid ?? 0,
    };
  }

  private async getUsedCategoryNames(): Promise<string[]> {
    const categories = await this.db.category.findMany({
      where: {
        lotCategory: {
          some: {
            lot: { auction: { isPublished: true, isApproved: true } },
          },
        },
      },
      select: { name: true },
    });

    return categories.map((category) => category.name);
  }
}

export const auctionService = new AuctionService();
