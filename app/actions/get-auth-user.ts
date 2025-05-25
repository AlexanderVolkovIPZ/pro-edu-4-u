import { GetServerSessionParams } from '../types';
import { getSession } from './get-session';
import prismaDb from '@/lib/prismadb';

export default async function getAuthUser(args?: GetServerSessionParams) {
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

    return {
      ...currentUser,
      provider: session.provider,
    };
  } catch {
    return null;
  }
}
