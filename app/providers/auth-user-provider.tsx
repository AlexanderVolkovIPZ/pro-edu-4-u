'use client';
import type { AuthUser as AuthUserType } from '@/app/_shared/types/auth-user';
import { createContext } from 'react';

type AuthUser = AuthUserType | null;

export const AuthUserContext = createContext<AuthUser>(null);

export const AuthUserProvider = ({ authUser, children }: { authUser: AuthUser; children: React.ReactNode }) => {
  return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>;
};
