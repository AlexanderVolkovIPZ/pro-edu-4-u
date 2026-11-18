import { AuthUser } from '@/app/_shared/types/auth-user';
import { GetServerSessionParams } from '../types';
import { getSession } from './get-session';
import prismaDb from '@/lib/prismadb';

export type { AuthUser };

export default async function getAuthUser(args?: GetServerSessionParams): Promise<AuthUser | null> {
  try {
    const session = await getSession(...(args ?? []));

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prismaDb.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (!currentUser) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = currentUser;

    return {
      ...safeUser,
      provider: session.provider,
    };
  } catch {
    return null;
  }
}
