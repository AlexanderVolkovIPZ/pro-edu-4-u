"use client";

import React, { createContext } from "react";
import getAuthUser from "../actions/get-auth-user";

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

export const AuthUserProvider = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const authUser = await getAuthUser();

  return (
    <AuthUserContext.Provider value={authUser}>
      {children}
    </AuthUserContext.Provider>
  );
};
