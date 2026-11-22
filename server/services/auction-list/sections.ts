import { Prisma } from '@prisma/client';

export type AuctionSectionKey = 'draft' | 'active' | 'upcoming' | 'ended';

export type AuctionSection = {
  key: AuctionSectionKey;
  where: Prisma.AuctionWhereInput;
  orderBy: Prisma.AuctionOrderByWithRelationInput;
};

export type LotFilter = {
  minLotPrice?: number;
  maxLotPrice?: number;
  categories?: string[];
};

/** Conditions a lot must satisfy for its auction to be listed (price range, categories). */
export function buildLotConditions({ minLotPrice, maxLotPrice, categories }: LotFilter): Prisma.LotWhereInput {
  const conditions: Prisma.LotWhereInput = {};

  if (minLotPrice !== undefined || maxLotPrice !== undefined) {
    conditions.startBid = {
      ...(minLotPrice !== undefined && { gte: minLotPrice }),
      ...(maxLotPrice !== undefined && { lte: maxLotPrice }),
    };
  }

  if (categories?.length) {
    conditions.lotCategory = {
      some: {
        category: {
          name: {
            in: categories,
          },
        },
      },
    };
  }

  return conditions;
}

type BuildSectionsInput = {
  /** Restrictions shared by every section (e.g. the auctions visible to the user). */
  base: Prisma.AuctionWhereInput;
  lotConditions: Prisma.LotWhereInput;
  includeDrafts: boolean;
  now?: Date;
};

/**
 * Describes the sections of the auction catalogue in display order. Each
 * section is a self-contained query specification (where + ordering).
 */
export function buildAuctionSections({
  base,
  lotConditions,
  includeDrafts,
  now = new Date(),
}: BuildSectionsInput): AuctionSection[] {
  const hasLotConditions = Object.keys(lotConditions).length > 0;
  const published = { isPublished: true, isApproved: true };

  const sections: AuctionSection[] = [
    {
      key: 'active',
      where: {
        ...base,
        ...published,
        startDate: { lte: now },
        endDate: { gt: now },
        lot: { some: { AND: [{ isSold: false }, lotConditions] } },
      },
      orderBy: { startDate: 'asc' },
    },
    {
      key: 'upcoming',
      where: {
        ...base,
        ...published,
        startDate: { gt: now },
        endDate: { gt: now },
        lot: { some: { AND: [{ isSold: false }, lotConditions] } },
      },
      orderBy: { startDate: 'asc' },
    },
    {
      key: 'ended',
      where: {
        ...base,
        ...published,
        OR: [{ lot: { every: { isSold: true } } }, { endDate: { lt: now } }],
        ...(hasLotConditions && { lot: { some: lotConditions } }),
      },
      orderBy: { endDate: 'desc' },
    },
  ];

  if (includeDrafts) {
    sections.unshift({
      key: 'draft',
      where: {
        ...base,
        isApproved: false,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  return sections;
}
