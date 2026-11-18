import { stripe } from '@/app/lib/stripe';
import prismaDb from '@/lib/prismadb';
import { HttpError, parseBody, withAuth } from '@/server/http';
import { createPaymentSchema } from '@/server/schemas/payment.schema';
import { BidType } from '@prisma/client';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const POST = withAuth(
  async ({ request, authUser }) => {
    const { lots: lotsId, shippingInfo, bidType } = await parseBody(request, createPaymentSchema);

    const lots = await prismaDb.lot.findMany({
      where: {
        id: { in: lotsId },
      },
    });

    if (!lots.length) {
      throw HttpError.notFound('Lots not found');
    }

    const alreadyPaidBid = await prismaDb.bid.findFirst({
      where: {
        lotId: { in: lotsId },
        bidderId: authUser.id,
        isWinner: true,
        isPaid: true,
      },
    });
    if (alreadyPaidBid) {
      throw HttpError.badRequest('You have already paid for one of the selected lots');
    }

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (bidType === BidType.BIDDING) {
      const bids = await prismaDb.bid.findMany({
        where: {
          lotId: { in: lotsId },
          bidderId: authUser.id,
          isPaid: false,
          isWinner: true,
        },
      });

      if (!bids.length) {
        throw HttpError.notFound('No valid bids found');
      }

      lineItems = bids.map((bid) => {
        const lot = lots.find((l) => l.id === bid.lotId);
        return {
          quantity: 1,
          price_data: {
            currency: 'UAH',
            product_data: {
              name: lot?.title || 'Auction Lot',
            },
            unit_amount: Math.round(bid.amount * 100),
          },
        };
      });
    } else {
      const buyNowLotId = lotsId[0];

      const lot = lots.find((l) => l.id === buyNowLotId);
      if (!lot) {
        throw HttpError.notFound('Lot not found');
      }

      if (lot.isSold) {
        throw HttpError.conflict('Lot is already sold');
      }

      if (!lot.buyNowBid) {
        throw HttpError.notFound('Buy now bid not found');
      }

      lineItems = [
        {
          quantity: 1,
          price_data: {
            currency: 'UAH',
            product_data: {
              name: lot.title || 'Auction Lot',
              metadata: {
                lotId: lot.id,
                price: lot.buyNowBid,
              },
            },
            unit_amount: Math.round(lot.buyNowBid * 100),
          },
        },
      ];
    }

    let stripeCustomerId = authUser.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: authUser.email ?? undefined,
        name: authUser.name ?? undefined,
      });

      await prismaDb.user.update({
        where: { id: authUser.id },
        data: { stripeCustomerId: customer.id },
      });

      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: lineItems,
      mode: 'payment',
      locale: 'en',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/won-lots/payment?id=[${lotsId.map((id) => `"${id}"`).join(',')}]&canceled=1`,
      metadata: {
        userId: authUser.id,
        lotsId: JSON.stringify(lotsId),
        bidType,
        ...shippingInfo,
      },
    });

    return NextResponse.json({ url: session.url });
  },
  { label: 'PAYMENT_AUCTION' }
);
