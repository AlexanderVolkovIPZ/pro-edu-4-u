import { test, expect } from '../../src/fixtures';
import { accessCases } from '../../src/data/DataProvider';
import { seedId } from '../../config/env';
import type { AuctionsApi } from '../../src/business/api/AuctionsApi';

// AT-03. Who can edit an auction: R = A AND (B OR C) from lab 4 (MC-1 - MC-4).
// All cases change the same auction, so they run one after another.
test.describe.configure({ mode: 'default' });

for (const c of accessCases()) {
  test.describe(`AT-03 ${c.id}`, () => {
    let auctionId: string;
    let admin: AuctionsApi;
    let originalTitle: string;

    test.beforeEach(async ({ apiAs }) => {
      auctionId = seedId('auctions', c.auction);
      admin = await apiAs('admin');
      originalTitle = await admin.getTitle(auctionId);
    });

    test.afterEach(async ({ log }) => {
      // post-condition: restore the title so that tests do not depend on each other
      const res = await admin.update(auctionId, { title: originalTitle });
      if (res.status !== 200) log.warn(`title not restored: ${res.status}`);
    });

    test(`${c.actor} edits the auction → ${c.expect} @api @regression`, async ({ apiAs }) => {
      // a blocked user will not get a session - that is expected
      const actor = await apiAs(c.actor, { mustLogin: c.actor !== 'blockedOwner' });
      const newTitle = `TAF ${c.id} ${Date.now()}`;

      const res = await actor.update(auctionId, { title: newTitle });
      const titleAfter = await admin.getTitle(auctionId);

      if (c.expect === 'allowed') {
        expect(res.status, 'editing is allowed').toBe(200);
        expect(titleAfter).toBe(newTitle);
      } else {
        expect([401, 403], 'editing is forbidden').toContain(res.status);
        expect(titleAfter, 'nothing changed in the database').toBe(originalTitle);
      }
    });
  });
}
