'use client';

import { ClientToServerEvents, ServerToClientEvents } from '@/pages/api/socket/io';
import { createContext, useEffect, useState } from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketContextType = {
  socket: TypedSocket | null;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initSocket: TypedSocket = ClientIO(process.env.NEXT_PUBLIC_BASE_URL, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
    });

    initSocket.on('connect', () => {
      console.info('connected');
      setIsConnected(true);
    });

    initSocket.on('disconnect', () => {
      console.info('disconnected');
      setIsConnected(false);
    });

    setSocket(initSocket);

    return () => {
      initSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{ isConnected, socket }}>{children}</SocketContext.Provider>;
};
