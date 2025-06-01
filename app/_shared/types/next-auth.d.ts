import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    provider?: string;
    user: {
      isActive?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    isActive?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isActive?: boolean;
    provider?: string;
  }
}
