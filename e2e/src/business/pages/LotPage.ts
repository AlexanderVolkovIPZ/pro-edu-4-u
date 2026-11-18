import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { lotLocators } from '../locators/lot.locators';
import { parseMoney } from '../../core/money';

export interface LotPrices {
  current: number;
  min: number;
  buyout: number;
}

const NUMBER = /^-?\d+([.,]\d+)?$/;

export class LotPage extends BasePage {
  private readonly el;
  // the start price and the buyout price are shown only on the "Overview" tab, so they are remembered on open
  private start = 0;
  private buyout = 0;

  constructor(page: Page) {
    super(page);
    this.el = lotLocators(page);
  }

  // Opens the lot page, reads prices from the "Overview" tab and switches to the "Bid process" tab.
  async open(auctionId: string, lotId: string): Promise<void> {
    await this.openPath(`/auctions/${auctionId}/lots/${lotId}/overview`);
    this.start = parseMoney(await this.el.startPrice.textContent());
    this.buyout = parseMoney(await this.el.buyoutPrice.textContent());
    await this.el.bidTab.click();
    await expect(this.el.bidInput).toBeEditable();
    await expect(this.el.connecting).toBeHidden(); // wait for the Socket.io connection
  }

  async readPrices(): Promise<LotPrices> {
    return {
      current: await this.currentPrice(),
      // the page has no separate "minimum bid" label; the value is in the min attribute of the amount field
      min: Number(await this.el.bidInput.getAttribute('min')),
      buyout: this.buyout,
    };
  }

  async enterBid(amount: string): Promise<void> {
    if (NUMBER.test(amount)) {
      await this.el.bidInput.fill(amount);
      return;
    }
    // The field has type=number, so Playwright does not allow fill() with text ("abc").
    // So the field is cleared and the characters are typed on the keyboard, as a user would do.
    await this.el.bidInput.fill('');
    await this.el.bidInput.pressSequentially(amount);
  }

  async submitBid(): Promise<void> {
    await this.el.bidSubmit.click();
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.el.bidSubmit).toBeDisabled();
  }

  async expectBidError(): Promise<void> {
    await expect(this.el.bidError).toBeVisible();
  }

  // The price arrives through Socket.io, so we wait for it (expect.poll) instead of sleeping.
  async expectCurrentPrice(expected: number): Promise<void> {
    await expect
      .poll(() => this.currentPrice(), {
        message: `current price should be ${expected}`,
        timeout: 5_000,
      })
      .toBe(expected);
  }

  // The current price is the highest bid (top row of the history). While there are no bids, it is the start price.
  private async currentPrice(): Promise<number> {
    if ((await this.el.currentPrice.count()) === 0) return this.start;
    return parseMoney(await this.el.currentPrice.textContent());
  }

  protected async waitUntilLoaded(): Promise<void> {
    await expect(this.el.startPrice).toBeVisible();
    await expect(this.el.buyoutPrice).toBeVisible();
  }
}
