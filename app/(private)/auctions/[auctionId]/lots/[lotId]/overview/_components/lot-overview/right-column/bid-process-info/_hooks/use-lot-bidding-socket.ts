'use client';

import { BidCreatedPayload, BidRejectedPayload, LotFinalizedPayload, LotRoomRef } from '@/app/_shared/socket/events';
import { SocketContext } from '@/app/providers/socket-provider';
import { useCallback, useContext, useEffect, useRef } from 'react';

type Handlers = {
  onBidCreated: (bid: BidCreatedPayload) => void;
  onBidRejected: (reason: BidRejectedPayload) => void;
  onLotFinalized: (payload: LotFinalizedPayload) => void;
};

/**
 * Real-time channel of one lot: joins the lot room, forwards the events of
 * that lot to the handlers and exposes `placeBid`. The bidder is derived from
 * the socket session on the server, so only the amount is sent.
 */
export function useLotBiddingSocket({ auctionId, lotId }: LotRoomRef, handlers: Handlers) {
  const { socket, isConnected } = useContext(SocketContext);

  // Latest handlers without re-subscribing on every render.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!socket) return;

    const ref: LotRoomRef = { auctionId, lotId };

    const onBidCreated = (bid: BidCreatedPayload) => {
      if (bid.lotId === lotId) handlersRef.current.onBidCreated(bid);
    };
    const onBidRejected = (reason: BidRejectedPayload) => handlersRef.current.onBidRejected(reason);
    const onLotFinalized = (payload: LotFinalizedPayload) => {
      if (payload.lotId === lotId) handlersRef.current.onLotFinalized(payload);
    };
    const join = () => socket.emit('joinLot', ref);

    socket.on('bidCreated', onBidCreated);
    socket.on('bidRejected', onBidRejected);
    socket.on('lotFinalized', onLotFinalized);
    socket.on('connect', join);
    join();

    return () => {
      socket.off('bidCreated', onBidCreated);
      socket.off('bidRejected', onBidRejected);
      socket.off('lotFinalized', onLotFinalized);
      socket.off('connect', join);
      socket.emit('leaveLot', ref);
    };
  }, [socket, auctionId, lotId]);

  const placeBid = useCallback(
    (amount: number): boolean => {
      if (!socket || !isConnected) return false;

      socket.emit('newBid', { auctionId, lotId, amount });
      return true;
    },
    [socket, isConnected, auctionId, lotId]
  );

  return { placeBid, isConnected: !!socket && isConnected };
}
