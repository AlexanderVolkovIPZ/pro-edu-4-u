import NextAuth, { AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prismaDb from '@/lib/prismadb';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaDb),
  providers: [
    Github({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) {
          throw new Error('toast.error.invalid_credentials');
        }

        const user = await prismaDb.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user?.password) {
          throw new Error('toast.error.invalid_credentials');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          throw new Error('toast.error.invalid_credentials');
        }

        if (!user.isActive) {
          throw new Error('toast.error.user_is_not_active');
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider as string;
      }

      return token;
    },
    async session({ session, token }) {
      session.provider = token.provider as string;
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
