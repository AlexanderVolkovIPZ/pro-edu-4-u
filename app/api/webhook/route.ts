import prismaDb from '@/lib/prismadb';
import { HttpError, withErrorHandling } from '@/server/http';
import { shippingInfoSchema } from '@/server/schemas/payment.schema';
import { BidType } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { z } from 'zod';

const checkoutMetadataSchema = shippingInfoSchema.extend({
  userId: z.string(),
  lotsId: z.string().transform((value) => JSON.parse(value) as string[]),
  bidType: z.nativeEnum(BidType),
});

export const POST = withErrorHandling(
  async ({ request }) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      throw HttpError.badRequest('Missing Stripe signature');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new HttpError(500, 'Missing webhook secret');
    }

    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw HttpError.badRequest('Webhook signature verification failed');
    }

    if (event.type !== 'checkout.session.completed') {
      console.error(`Unhandled event type: ${event.type}`);
      return new NextResponse(null, { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = checkoutMetadataSchema.safeParse(session.metadata);

    if (!metadata.success) {
      console.error('Missing required metadata:', metadata.error.flatten());
      throw HttpError.badRequest('Webhook Error: Missing required metadata');
    }

    const { userId, lotsId, bidType, ...shippingInfo } = metadata.data;

    if (bidType === BidType.BIDDING) {
      await prismaDb.bid.updateMany({
        data: {
          isPaid: true,
        },
        where: {
          lotId: {
            in: lotsId,
          },
          bidderId: userId,
          isWinner: true,
        },
      });
    } else {
      const [lotId] = lotsId;
      const lot = await prismaDb.lot.findUnique({
        where: {
          id: lotId,
        },
      });

      if (!lot?.buyNowBid) {
        throw HttpError.badRequest('Webhook Error: Missing buy now bid');
      }

      await prismaDb.$transaction([
        prismaDb.bid.create({
          data: {
            amount: lot.buyNowBid,
            lotId,
            bidderId: userId,
            isPaid: true,
            isWinner: true,
            type: BidType.INSTANT,
          },
        }),
        prismaDb.lot.update({
          data: {
            isSold: true,
          },
          where: {
            id: lotId,
          },
        }),
      ]);
    }

    await prismaDb.shipping.createMany({
      data: lotsId.map((lotId) => ({
        ...shippingInfo,
        userId,
        lotId,
      })),
    });

    return new NextResponse(null, { status: 200 });
  },
  { label: 'STRIPE_WEBHOOK' }
);
