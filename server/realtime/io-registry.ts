import { ClientToServerEvents, ServerToClientEvents } from '@/app/_shared/socket/events';
import { AuthUser } from '@/app/_shared/types/auth-user';
import { Server, Socket } from 'socket.io';

export type SocketData = { user: AuthUser | null };

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

declare global {
  // eslint-disable-next-line no-var
  var socketIoServer: TypedServer | undefined;
}

/**
 * The Socket.io server is created by the Pages Router handler, but App Router
 * code (services, route handlers) needs to publish events too. Both module
 * graphs share `globalThis`, so the instance is registered there.
 */
export function setIo(io: TypedServer): void {
  globalThis.socketIoServer = io;
}

export function getIo(): TypedServer | undefined {
  return globalThis.socketIoServer;
}
