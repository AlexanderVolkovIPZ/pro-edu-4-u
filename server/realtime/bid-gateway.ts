import { BidRejectionCode } from '@/app/_shared/domain/bidding';
import { getLotRoom } from '@/app/_shared/socket/events';
import { lotRefSchema, socketBidSchema } from '../schemas/bid.schema';
import { BidRejectedError, bidService } from '../services/bid.service';
import { TypedSocket } from './io-registry';

const reject = (socket: TypedSocket, code: BidRejectionCode, message: string) =>
  socket.emit('bidRejected', { code, message });

/**
 * WebSocket entry point for bidding. It only authenticates, validates the
 * payload and delegates to `BidService`; the business rules live there and
 * are shared with the REST endpoint.
 */
export function registerBidGateway(socket: TypedSocket): void {
  socket.on('joinLot', (ref) => {
    const parsed = lotRefSchema.safeParse(ref);
    if (parsed.success) socket.join(getLotRoom(parsed.data));
  });

  socket.on('leaveLot', (ref) => {
    const parsed = lotRefSchema.safeParse(ref);
    if (parsed.success) socket.leave(getLotRoom(parsed.data));
  });

  socket.on('newBid', async (payload) => {
    const user = socket.data.user;
    if (!user) {
      return reject(socket, 'UNAUTHORIZED', 'You must be signed in to bid');
    }

    const parsed = socketBidSchema.safeParse(payload);
    if (!parsed.success) {
      return reject(socket, 'INVALID_PAYLOAD', 'Invalid bid payload');
    }

    try {
      // Successful bids are broadcast to the lot room by the service.
      await bidService.place(user, parsed.data);
    } catch (error) {
      if (error instanceof BidRejectedError) {
        return reject(socket, error.code, error.message);
      }

      console.error('SOCKET_BID_ERROR ->', error);
      return reject(socket, 'LOT_NOT_FOUND', 'Failed to place the bid');
    }
  });
}
