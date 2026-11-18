import { guiTest as test } from '../../src/fixtures';
import { bidCases, resolveAmount } from '../../src/data/DataProvider';
import { seedLot } from '../../config/env';

// AT-02. Bid on a lot (DDT: bids.json, valid / boundary / invalid sets).
// Tests of one browser run one after another on one lot: an accepted bid changes the price.
test.describe.configure({ mode: 'default' });

test.describe('AT-02 bid on a lot', () => {
  test.beforeEach(async ({ loginAs, lotPage, resetLot }, testInfo) => {
    const lot = seedLot(testInfo.project.name); // its own lot for every browser
    resetLot(lot.lotId); // pre-condition: lot without bids, bidding in progress
    await loginAs('buyer');
    await lotPage.open(lot.auctionId, lot.lotId);
  });

  test.afterEach(async ({ lotPage, log }) => {
    // post-condition: record the lot state after the test, so the next test has a clear starting point
    const p = await lotPage.readPrices().catch(() => null);
    log.info(`lot state after the test: ${p ? JSON.stringify(p) : 'not read'}`);
  });

  for (const c of bidCases()) {
    test(`AT-02 ${c.id} [${c.set}] ${c.title} @gui @regression`, async ({ lotPage, log }) => {
      const before = await lotPage.readPrices();
      const amount = resolveAmount(c.amount, before);
      log.info(`prices ${JSON.stringify(before)}, entering "${amount}", expecting ${c.expect}`);

      await lotPage.enterBid(amount);

      if (c.expect === 'disabled') {
        await lotPage.expectSubmitDisabled();
        await lotPage.expectCurrentPrice(before.current);
      } else if (c.expect === 'rejected') {
        await lotPage.submitBid();
        await lotPage.expectBidError();
        await lotPage.expectCurrentPrice(before.current);
      } else {
        await lotPage.submitBid();
        await lotPage.expectCurrentPrice(Number(amount));
      }
    });
  }
});
