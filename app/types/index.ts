import { Auction, Lot, Photo, Video } from '@prisma/client';

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

export type CreateVideoType = {
  id: Video['id'];
  position: Video['position'];
  name: Video['name'];
  file: string;
  isVideoUploaded: boolean;
}[];

export type DeleteVideoType = { id: string };

export type ReorderVideoType = {
  id: string;
  position: number;
};

export type AuctionData = Pick<Auction, 'id' | 'title'> & {
  startDate: string;
  endDate: string;
  description: string;
  lot: Lot[];
};
