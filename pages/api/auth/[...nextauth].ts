import { authOptions } from '@/app/lib/auth/auth-options';
import NextAuth from 'next-auth';

export default NextAuth(authOptions);
