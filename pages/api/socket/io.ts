import { Bid, User } from '@prisma/client';
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
      io?: SocketIoServer;
    };
  };
};

export type ServerToClientEvents = {
  error: (status: number, message: string) => void;
  bidCreated: (bidInfo: Bid & { user: Pick<User, 'name' | 'id'> }) => void;
};

export type ClientToServerEvents = {
  newBid: (data: Pick<Bid, 'lotId' | 'amount'> & { userId: string }) => void;
};

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (!res.socket.server.io) {
    const httpServer = res.socket.server;
    const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        methods: ['GET', 'POST'],
      },
      pingInterval: 5000,
      pingTimeout: 20000,
    });

    res.socket.server.io = io;

    io.on('connection', async (socket) => {
      try {
        // const authUser = await getAuthUser([req, res]);
        // if (!authUser) {
        //   socket.emit('error', 401, 'You are not authorized to connect');
        //   socket.disconnect();
        //   return;
        // }

        socket.on('newBid', async ({ lotId, amount, userId }) => {
          try {
            const createdBid = await prismaDb?.bid.create({
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

        socket.on('disconnect', () => {
          console.info('User disconnected:', socket.id);
        });
      } catch (error) {
        console.error('AUTH_ERROR ->', error);
        socket.emit('error', 500, 'Authorization failed');
        socket.disconnect();
      }
    });
  }

  res.end();
  res.send({});
}
