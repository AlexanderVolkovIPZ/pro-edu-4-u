import { BidCreatedPayload, getLotRoom, LotFinalizedPayload } from '@/app/_shared/socket/events';
import { getIo } from './io-registry';

/**
 * Observer interface for domain events that interest connected clients.
 * Services depend on this abstraction, not on Socket.io.
 */
export interface RealtimePublisher {
  bidCreated(bid: BidCreatedPayload): void;
  lotFinalized(payload: LotFinalizedPayload): void;
}

/** Publishes to everybody who joined the lot's room. No-op when no socket server is running. */
export class SocketRealtimePublisher implements RealtimePublisher {
  bidCreated(bid: BidCreatedPayload): void {
    getIo()?.to(getLotRoom(bid)).emit('bidCreated', bid);
  }

  lotFinalized(payload: LotFinalizedPayload): void {
    getIo()?.to(getLotRoom(payload)).emit('lotFinalized', payload);
  }
}

export const realtimePublisher = new SocketRealtimePublisher();
