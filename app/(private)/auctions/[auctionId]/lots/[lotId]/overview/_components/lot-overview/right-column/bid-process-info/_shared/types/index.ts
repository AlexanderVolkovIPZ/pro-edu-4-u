import { Bid } from '@prisma/client';

export type BidInfo = Pick<Bid, 'amount' | 'id' | 'type'> & {
  bidderId: string;
  createdAt: string;
  bidderName: string;
  isWinner: boolean;
};
