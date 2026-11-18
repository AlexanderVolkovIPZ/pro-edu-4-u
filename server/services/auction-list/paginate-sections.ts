/**
 * Generic pagination over several ordered "sections" (e.g. drafts, active,
 * upcoming and ended auctions). The sections are concatenated logically and a
 * single page window is cut across them, so a page may contain the tail of
 * one section followed by the head of the next.
 */
export type PageSection<T> = {
  count(): Promise<number>;
  fetch(skip: number, take: number): Promise<T[]>;
};

export type Page<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export async function paginateSections<T>(sections: PageSection<T>[], page: number, limit: number): Promise<Page<T>> {
  const counts = await Promise.all(sections.map((section) => section.count()));
  const total = counts.reduce((sum, count) => sum + count, 0);

  const items: T[] = [];
  let remaining = limit;
  let offset = (page - 1) * limit;

  for (let index = 0; index < sections.length && remaining > 0; index++) {
    if (offset >= counts[index]) {
      offset -= counts[index];
      continue;
    }

    const chunk = await sections[index].fetch(offset, remaining);
    items.push(...chunk);
    remaining -= chunk.length;
    offset = 0;
  }

  return { items, total, totalPages: Math.ceil(total / limit), page, limit };
}
