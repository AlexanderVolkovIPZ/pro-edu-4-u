import { Server as HttpServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIoServer } from 'socket.io';
import prismaDb from '@/lib/prismadb';
import { ClientToServerEvents, ServerToClientEvents, SOCKET_PATH } from '@/app/_shared/socket/events';

export const config = {
  api: {
    bodyParser: false,
  },
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: SocketIoServer;
    };
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (!res.socket.server.io) {
    const httpServer = res.socket.server;
    const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      path: SOCKET_PATH,
      addTrailingSlash: false,
      cors: {
        methods: ['GET', 'POST'],
      },
      pingInterval: 5000,
      pingTimeout: 20000,
    });

    res.socket.server.io = io;

    io.on('connection', async (socket) => {
      socket.on('newBid', async ({ lotId, amount, userId }) => {
        try {
          const createdBid = await prismaDb.bid.create({
            data: {
              lotId,
              amount,
              bidderId: userId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          if (!createdBid) {
            throw new Error('Bid creation failed');
          }

          io.emit('bidCreated', createdBid);
        } catch (error) {
          console.error('BID_CREATION_ERROR ->', error);
          socket.emit('error', 500, 'Failed to create bid');
        }
      });
    });
  }

  res.end();
}
