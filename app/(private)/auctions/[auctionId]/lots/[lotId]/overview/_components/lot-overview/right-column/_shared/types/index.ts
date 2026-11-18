import { Bid, Category, Lot, Status, User } from '@prisma/client';

export type LotOverviewInfo = {
  categories?: {
    categoryId: Category['id'];
    category: Category;
  }[];
} & Pick<Lot, 'startBid' | 'buyNowBid' | 'minBidIncrement' | 'description' | 'id' | 'isSold' | 'title'> & {
    bids?: (Bid & {
      user: Pick<User, 'id' | 'name'>;
    })[];
  };

export type LotStatus = Status;
