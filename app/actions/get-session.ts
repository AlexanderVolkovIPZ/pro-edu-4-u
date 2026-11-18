import { authOptions } from '@/app/lib/auth/auth-options';
import { getServerSession } from 'next-auth';
import { GetServerSessionParams } from '../types';

export async function getSession(...args: GetServerSessionParams) {
  if (args.length === 2) {
    const [req, res] = args;
    return getServerSession(req, res, authOptions);
  }

  return getServerSession(authOptions);
}
