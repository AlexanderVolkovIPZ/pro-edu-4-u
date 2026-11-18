import { guiTest as test, expect } from '../../src/fixtures';
import { catalogCases, tags } from '../../src/data/DataProvider';

// AT-04. Catalog filter (DDT: catalog.json). Only a signed-in user can see the catalog.
for (const c of catalogCases()) {
  test(`AT-04 ${c.id} filter: ${c.title} ${tags('@gui', '@regression', c.smoke && '@smoke')}`, async ({ catalogPage, loginAs }) => {
    await loginAs('buyer');
    await catalogPage.open();
    await catalogPage.filter(c.filter);

    if (c.expectEmpty) {
      await catalogPage.expectEmpty();
      return;
    }
    // the list updates asynchronously, so we wait until all prices fall into the range
    await expect
      .poll(async () => {
        const prices = await catalogPage.prices();
        return prices.length > 0 && prices.every((p) => p >= c.filter.min && p <= c.filter.max);
      }, { message: `all lots are within ${c.filter.min}–${c.filter.max}` })
      .toBe(true);
  });
}
