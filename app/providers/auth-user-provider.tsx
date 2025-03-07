'use client';
import { User } from '@prisma/client';
import { createContext } from 'react';

type AuthUser = User | null;

export const AuthUserContext = createContext<AuthUser>(null);

export const AuthUserProvider = ({ authUser, children }: { authUser: AuthUser; children: React.ReactNode }) => {
  return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>;
};
