import getAuthUser from '@/app/actions/get-auth-user';
import { stripe } from '@/app/lib/stripe';
import { BidType, Shipping } from '@prisma/client';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prismaDb from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const body: {
      lots: string[];
      shippingInfo: Omit<Shipping, 'id' | 'createdAt' | 'updatedAt' | 'lotId' | 'userId' | 'status'>;
      bidType: BidType;
    } = await request.json();
    const { lots: lotsId, shippingInfo, bidType } = body;

    const lots = await prismaDb.lot.findMany({
      where: {
        id: { in: lotsId },
      },
    });

    if (!lots?.length) {
      return new NextResponse('Lots not found', { status: 404 });
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
      return new NextResponse('You have already paid for one of the selected lots', { status: 400 });
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

      if (!bids?.length) {
        return new NextResponse('No valid bids found', { status: 404 });
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
    } else if (bidType === BidType.INSTANT) {
      const buyNowLotId = lotsId[0];

      const lot = lots.find((l) => l.id === buyNowLotId);
      if (!lot) {
        return new NextResponse('Lot not found', { status: 404 });
      }

      if (!lot.buyNowBid) {
        return new NextResponse('Buy now bid not found', { status: 404 });
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
    } else {
      return new NextResponse('Invalid bid type', { status: 400 });
    }

    const stripeCustomer = await prismaDb.user.findUnique({
      where: {
        id: authUser.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    let stripeCustomerId = stripeCustomer?.stripeCustomerId;
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
  } catch (error) {
    console.error('PAYMENT_AUCTION_ERROR -> ', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
