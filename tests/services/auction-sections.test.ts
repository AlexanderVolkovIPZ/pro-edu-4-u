import { buildAuctionSections, buildLotConditions } from '@/server/services/auction-list/sections';
import { describe, expect, it } from 'vitest';

describe('buildLotConditions', () => {
  it('is empty without filters', () => {
    expect(buildLotConditions({})).toEqual({});
  });

  it('builds a price range and a category filter', () => {
    expect(buildLotConditions({ minLotPrice: 10, maxLotPrice: 50, categories: ['Art'] })).toEqual({
      startBid: { gte: 10, lte: 50 },
      lotCategory: { some: { category: { name: { in: ['Art'] } } } },
    });
  });

  it('supports an open-ended range', () => {
    expect(buildLotConditions({ minLotPrice: 10 })).toEqual({ startBid: { gte: 10 } });
  });
});

describe('buildAuctionSections', () => {
  const now = new Date('2025-06-07T10:00:00Z');

  it('lists active, upcoming and ended auctions in that order', () => {
    const sections = buildAuctionSections({ base: {}, lotConditions: {}, includeDrafts: false, now });

    expect(sections.map((section) => section.key)).toEqual(['active', 'upcoming', 'ended']);
    expect(sections[0].where).toMatchObject({ isPublished: true, isApproved: true, startDate: { lte: now } });
    expect(sections[2].orderBy).toEqual({ endDate: 'desc' });
  });

  it('puts drafts first when requested', () => {
    const sections = buildAuctionSections({ base: {}, lotConditions: {}, includeDrafts: true, now });

    expect(sections[0].key).toBe('draft');
    expect(sections[0].where).toEqual({ isApproved: false });
  });

  it('applies the base filter and the lot conditions to every section', () => {
    const base = { id: { in: ['a', 'b'] } };
    const lotConditions = { startBid: { gte: 10 } };
    const sections = buildAuctionSections({ base, lotConditions, includeDrafts: false, now });

    for (const section of sections) {
      expect(section.where).toMatchObject(base);
    }

    expect(sections[0].where.lot).toEqual({ some: { AND: [{ isSold: false }, lotConditions] } });
    expect(sections[2].where.lot).toEqual({ some: lotConditions });
  });
});
