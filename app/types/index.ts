import { Auction, Lot, Photo } from '@prisma/client';

export type CreatePhotoType = {
  id: Photo['id'];
  position: Photo['position'];
  name: Photo['name'];
  file: string;
  isImageUploaded: boolean;
}[];

export type DeletePhotoType = { id: string };

export type ReorderPhotoType = {
  id: string;
  position: number;
};

export type AuctionData = Pick<Auction, 'id' | 'title'> & {
  startDate: string;
  endDate: string;
  description: string;
  lot: Lot[];
};
