'use client';
import { createContext } from 'react';

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

export const AuthUserProvider = ({ authUser, children }: { authUser: AuthUser; children: React.ReactNode }) => {
  return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>;
};
