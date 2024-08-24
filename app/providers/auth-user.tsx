'use client';
import { createContext, useEffect, useState } from 'react';
import getAuthUser from '../actions/get-auth-user';

type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null;

export const AuthUserContext = createContext<AuthUser>(null);

export const AuthUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      const authUser = await getAuthUser();
      setAuthUser(authUser);
    })();
  }, []);

  return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>;
};
