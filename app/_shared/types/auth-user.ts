import { User } from '@prisma/client';

/**
 * Current user as exposed to application code (server and client). The
 * password hash is never part of it: the object is passed to client
 * components and serialised into the page payload.
 */
export type AuthUser = Omit<User, 'password'> & { provider?: string };
