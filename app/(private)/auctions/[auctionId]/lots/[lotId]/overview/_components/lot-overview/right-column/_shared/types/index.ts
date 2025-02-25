import { Bid, Category, Lot, User } from '@prisma/client';

export type LotOverviewInfo = {
  categories?: {
    categoryId: Category['id'];
    category: Category;
  }[];
} & Pick<Lot, 'startBid' | 'buyNowBid' | 'minBidIncrement' | 'description' | 'id' | 'isSold'> & {
    bids?: (Bid & {
      user: Pick<User, 'id' | 'name'>;
    })[];
  };

export type LotStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
