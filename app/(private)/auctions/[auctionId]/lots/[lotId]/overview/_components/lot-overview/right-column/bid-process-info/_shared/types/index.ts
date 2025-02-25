import { Bid } from '@prisma/client';

export type BidInfo = Pick<Bid, 'amount' | 'id'> & {
  bidderId: string;
  createdAt: string;
  bidderName: string;
};
