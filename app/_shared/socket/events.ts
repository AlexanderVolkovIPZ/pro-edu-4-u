import { Bid, User } from '@prisma/client';

/** Path the Socket.io server is mounted on (shared by the server and the client). */
export const SOCKET_PATH = '/api/socket/io';

export type BidCreatedPayload = Bid & { user: Pick<User, 'name' | 'id'> };

export type ServerToClientEvents = {
  error: (status: number, message: string) => void;
  bidCreated: (bidInfo: BidCreatedPayload) => void;
};

export type ClientToServerEvents = {
  newBid: (data: Pick<Bid, 'lotId' | 'amount'> & { userId: string }) => void;
};
