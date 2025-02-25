import { Auction, Lot, LotCategory, Photo } from '@prisma/client';

export type AuctionWithLotsWithPhotosType = Auction & {
  startDate: string;
  endDate: string;
  description: string;
  lot: (Lot & { photo: Photo[]; lotCategory: LotCategory[] })[];
};
