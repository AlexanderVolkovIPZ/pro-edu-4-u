import { AuthUser } from '@/app/_shared/types/auth-user';
import prismaDb from '@/lib/prismadb';
import { getToken } from 'next-auth/jwt';
import { TypedSocket } from './io-registry';

function parseCookies(header: string | undefined): Partial<Record<string, string>> {
  const cookies: Partial<Record<string, string>> = {};

  for (const part of header?.split(';') ?? []) {
    const [name, ...rest] = part.trim().split('=');
    if (name) cookies[name] = decodeURIComponent(rest.join('='));
  }

  return cookies;
}

/**
 * Resolves the user behind a socket connection from the NextAuth session
 * cookie sent with the handshake. Returns `null` for anonymous sockets.
 */
export async function resolveSocketUser(socket: TypedSocket): Promise<AuthUser | null> {
  const request = socket.request;
  const token = await getToken({
    req: Object.assign(request, { cookies: parseCookies(request.headers.cookie) }),
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.email) {
    return null;
  }

  const user = await prismaDb.user.findUnique({ where: { email: token.email } });
  if (!user?.isActive) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
}

/** Socket.io middleware: attaches the authenticated user (or null) to the socket. */
export async function socketAuthMiddleware(socket: TypedSocket, next: (error?: Error) => void): Promise<void> {
  try {
    socket.data.user = await resolveSocketUser(socket);
  } catch (error) {
    console.error('SOCKET_AUTH_ERROR ->', error);
    socket.data.user = null;
  }

  next();
}
