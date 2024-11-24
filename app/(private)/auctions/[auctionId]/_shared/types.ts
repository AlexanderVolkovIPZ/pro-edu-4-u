import { Auction, Lot } from '@prisma/client';

export type AuctionData = Pick<Auction, 'id' | 'title'> & {
  startDate: string;
  endDate: string;
  description: string;
  lot: Lot[];
};
