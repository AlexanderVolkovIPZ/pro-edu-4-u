import { Bid, User } from '@prisma/client';
import { BidRejectionCode } from '../domain/bidding';

/** Path the Socket.io server is mounted on (shared by the server and the client). */
export const SOCKET_PATH = '/api/socket/io';

export type LotRoomRef = { auctionId: string; lotId: string };

export const getLotRoom = ({ lotId }: Pick<LotRoomRef, 'lotId'>) => `lot:${lotId}`;

export type BidCreatedPayload = Bid & { user: Pick<User, 'name' | 'id'> };

export type BidRejectedPayload = { code: BidRejectionCode; message: string };

export type LotFinalizedPayload = LotRoomRef & { winnerBidId: string; winnerId: string };

export type ServerToClientEvents = {
  bidCreated: (bid: BidCreatedPayload) => void;
  bidRejected: (reason: BidRejectedPayload) => void;
  lotFinalized: (payload: LotFinalizedPayload) => void;
};

/** The bidder is always the authenticated socket user; the client never sends a user id. */
export type ClientToServerEvents = {
  joinLot: (ref: LotRoomRef) => void;
  leaveLot: (ref: LotRoomRef) => void;
  newBid: (data: LotRoomRef & Pick<Bid, 'amount'>) => void;
};
