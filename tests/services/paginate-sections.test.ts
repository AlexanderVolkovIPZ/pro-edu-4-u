import { PageSection, paginateSections } from '@/server/services/auction-list/paginate-sections';
import { describe, expect, it, vi } from 'vitest';

const section = (items: string[]): PageSection<string> & { fetch: ReturnType<typeof vi.fn> } => ({
  count: async () => items.length,
  fetch: vi.fn(async (skip: number, take: number) => items.slice(skip, skip + take)),
});

describe('paginateSections', () => {
  it('cuts a page across consecutive sections', async () => {
    const sections = [section(['a1', 'a2', 'a3']), section(['b1', 'b2']), section(['c1'])];

    const page1 = await paginateSections(sections, 1, 4);
    const page2 = await paginateSections(sections, 2, 4);

    expect(page1.items).toEqual(['a1', 'a2', 'a3', 'b1']);
    expect(page2.items).toEqual(['b2', 'c1']);
    expect(page1).toMatchObject({ total: 6, totalPages: 2, page: 1, limit: 4 });
  });

  it('skips whole sections that lie before the page window', async () => {
    const sections = [section(['a1', 'a2']), section(['b1', 'b2']), section(['c1', 'c2'])];

    const page = await paginateSections(sections, 3, 2);

    expect(page.items).toEqual(['c1', 'c2']);
    expect(sections[0].fetch).not.toHaveBeenCalled();
    expect(sections[1].fetch).not.toHaveBeenCalled();
    expect(sections[2].fetch).toHaveBeenCalledWith(0, 2);
  });

  it('ignores empty sections', async () => {
    const sections = [section([]), section(['b1']), section([])];

    const page = await paginateSections(sections, 1, 10);

    expect(page.items).toEqual(['b1']);
    expect(page.totalPages).toBe(1);
  });

  it('returns an empty page beyond the last one', async () => {
    const page = await paginateSections([section(['a1'])], 5, 10);

    expect(page.items).toEqual([]);
    expect(page.total).toBe(1);
  });
});
