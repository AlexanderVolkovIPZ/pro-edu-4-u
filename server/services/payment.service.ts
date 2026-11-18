import { AuthUser } from '@/app/_shared/types/auth-user';
import { stripe } from '@/app/lib/stripe';
import prismaDb from '@/lib/prismadb';
import { BidType, PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { z } from 'zod';
import { HttpError } from '../http/http-error';
import { CreatePaymentInput, shippingInfoSchema } from '../schemas/payment.schema';

/** Data the checkout session carries through Stripe and back to the webhook. */
const checkoutMetadataSchema = shippingInfoSchema.extend({
  userId: z.string(),
  lotsId: z.string().transform((value) => JSON.parse(value) as string[]),
  bidType: z.nativeEnum(BidType),
});

export class PaymentService {
  constructor(
    private readonly db: PrismaClient = prismaDb,
    private readonly stripeClient: Stripe = stripe
  ) {}

  /** Creates a Stripe Checkout session for won lots or for a "buy now" purchase. */
  async createCheckoutSession(user: AuthUser, { lots: lotsId, shippingInfo, bidType }: CreatePaymentInput) {
    const lots = await this.db.lot.findMany({ where: { id: { in: lotsId } } });

    if (!lots.length) {
      throw HttpError.notFound('Lots not found');
    }

    const alreadyPaidBid = await this.db.bid.findFirst({
      where: { lotId: { in: lotsId }, bidderId: user.id, isWinner: true, isPaid: true },
    });
    if (alreadyPaidBid) {
      throw HttpError.badRequest('You have already paid for one of the selected lots');
    }

    const lineItems =
      bidType === BidType.BIDDING
        ? await this.buildWonLotsLineItems(user.id, lots)
        : this.buildBuyNowLineItems(lots, lotsId[0]);

    const customerId = await this.ensureStripeCustomer(user);

    const session = await this.stripeClient.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: 'payment',
      locale: 'en',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/won-lots/payment?id=[${lotsId.map((id) => `"${id}"`).join(',')}]&canceled=1`,
      metadata: {
        userId: user.id,
        lotsId: JSON.stringify(lotsId),
        bidType,
        ...shippingInfo,
      },
    });

    return { url: session.url };
  }

  /** Marks lots as paid / sold and records the shipping request after a successful checkout. */
  async handleCheckoutCompleted(rawMetadata: unknown) {
    const metadata = checkoutMetadataSchema.safeParse(rawMetadata);

    if (!metadata.success) {
      console.error('Missing required metadata:', metadata.error.flatten());
      throw HttpError.badRequest('Webhook Error: Missing required metadata');
    }

    const { userId, lotsId, bidType, ...shippingInfo } = metadata.data;

    if (bidType === BidType.BIDDING) {
      await this.db.bid.updateMany({
        data: { isPaid: true },
        where: { lotId: { in: lotsId }, bidderId: userId, isWinner: true },
      });
    } else {
      const [lotId] = lotsId;
      const lot = await this.db.lot.findUnique({ where: { id: lotId } });

      if (!lot?.buyNowBid) {
        throw HttpError.badRequest('Webhook Error: Missing buy now bid');
      }

      await this.db.$transaction([
        this.db.bid.create({
          data: {
            amount: lot.buyNowBid,
            lotId,
            bidderId: userId,
            isPaid: true,
            isWinner: true,
            type: BidType.INSTANT,
          },
        }),
        this.db.lot.update({ data: { isSold: true }, where: { id: lotId } }),
      ]);
    }

    await this.db.shipping.createMany({
      data: lotsId.map((lotId) => ({ ...shippingInfo, userId, lotId })),
    });
  }

  private async buildWonLotsLineItems(
    userId: string,
    lots: { id: string; title: string }[]
  ): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
    const bids = await this.db.bid.findMany({
      where: { lotId: { in: lots.map((lot) => lot.id) }, bidderId: userId, isPaid: false, isWinner: true },
    });

    if (!bids.length) {
      throw HttpError.notFound('No valid bids found');
    }

    return bids.map((bid) => ({
      quantity: 1,
      price_data: {
        currency: 'UAH',
        product_data: { name: lots.find((lot) => lot.id === bid.lotId)?.title || 'Auction Lot' },
        unit_amount: Math.round(bid.amount * 100),
      },
    }));
  }

  private buildBuyNowLineItems(
    lots: { id: string; title: string; isSold: boolean; buyNowBid: number | null }[],
    lotId: string
  ): Stripe.Checkout.SessionCreateParams.LineItem[] {
    const lot = lots.find((item) => item.id === lotId);
    if (!lot) {
      throw HttpError.notFound('Lot not found');
    }

    if (lot.isSold) {
      throw HttpError.conflict('Lot is already sold');
    }

    if (!lot.buyNowBid) {
      throw HttpError.notFound('Buy now bid not found');
    }

    return [
      {
        quantity: 1,
        price_data: {
          currency: 'UAH',
          product_data: {
            name: lot.title || 'Auction Lot',
            metadata: { lotId: lot.id, price: lot.buyNowBid },
          },
          unit_amount: Math.round(lot.buyNowBid * 100),
        },
      },
    ];
  }

  private async ensureStripeCustomer(user: AuthUser): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripeClient.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
    });

    await this.db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });

    return customer.id;
  }
}

export const paymentService = new PaymentService();
