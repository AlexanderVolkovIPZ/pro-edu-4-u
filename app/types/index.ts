import { Auction, Category, Lot, LotCategory, Photo, UserAuction, Video, LotDetail, Bid, User } from '@prisma/client';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next/types';

export type CreateFileType<T extends Photo | Video> = {
  id: T['id'];
  position: T['position'];
  name: T['name'];
  file: string;
  isFileUploaded: boolean;
}[];

export type DeleteFileType = { id: string };

export type ReorderFileType = {
  id: string;
  position: number;
};

export type LotWithRelationsType = Lot & {
  bid: (Bid & {
    user: Pick<User, 'id' | 'name'>;
  })[];
  photo: Photo[];
  video: Video[];
  lotCategory: (LotCategory & { category: Category })[];
  lotDetail: LotDetail[];
};

export type AuctionWithStringDates = Omit<Auction, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type AuctionWithRelationsType = AuctionWithStringDates & {
  lot: LotWithRelationsType[];
  userAuction: UserAuction[];
};

export type AuctionWithLotsType = Auction & { lot: Lot[] };

export type CreateLotCategoriesType = {
  categoryIds: LotCategory['categoryId'][];
};

export type CreateLotDetailsType = Pick<LotDetail, 'fieldName' | 'fieldValue' | 'iconName'>[];

export type GetServerSessionParams =
  | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
  | [NextApiRequest, NextApiResponse]
  | [];

export type AuctionMode = 'view' | 'edit';
