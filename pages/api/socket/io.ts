import { SOCKET_PATH } from '@/app/_shared/socket/events';
import { registerBidGateway, setIo, socketAuthMiddleware, TypedServer } from '@/server/realtime';
import { Server as HttpServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIoServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: TypedServer;
    };
  };
};

/**
 * Lazily starts the Socket.io server on the underlying HTTP server. The
 * actual event handling lives in `server/realtime`.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (!res.socket.server.io) {
    const io: TypedServer = new SocketIoServer(res.socket.server, {
      path: SOCKET_PATH,
      addTrailingSlash: false,
      cors: {
        methods: ['GET', 'POST'],
      },
      pingInterval: 5000,
      pingTimeout: 20000,
    });

    io.use(socketAuthMiddleware);
    io.on('connection', registerBidGateway);

    res.socket.server.io = io;
    setIo(io);
  }

  res.end();
}
