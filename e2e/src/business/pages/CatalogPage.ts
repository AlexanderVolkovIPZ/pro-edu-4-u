import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { catalogLocators } from '../locators/catalog.locators';
import { parseMoney } from '../../core/money';

export interface CatalogFilter {
  category: string;
  min: number;
  max: number;
}

export class CatalogPage extends BasePage {
  private readonly el;

  constructor(page: Page) {
    super(page);
    this.el = catalogLocators(page);
  }

  // The catalog is the home page. Bidium redirects a guest to sign-in, so sign in first.
  async open(): Promise<void> {
    await this.openPath('/');
  }

  async filter(f: CatalogFilter): Promise<void> {
    await this.el.openFilters.click();
    await this.el.category(f.category).check();
    await this.el.priceMin.fill(String(f.min));
    await this.el.priceMax.fill(String(f.max));
    await this.el.apply.click();
  }

  // A card shows the price as a range "₴1,500 - ₴4,000" (cheapest and most expensive lot),
  // so both numbers are taken from every card.
  async prices(): Promise<number[]> {
    const texts = await this.el.cardPrices.allTextContents();
    return texts.flatMap((text) => text.split(' - ').map(parseMoney));
  }

  async expectEmpty(): Promise<void> {
    await expect(this.el.empty).toBeVisible();
    await expect(this.el.cards).toHaveCount(0);
  }

  protected async waitUntilLoaded(): Promise<void> {
    // either there are cards or the "nothing found" message
    await expect(this.el.cards.first().or(this.el.empty)).toBeVisible();
  }
}
