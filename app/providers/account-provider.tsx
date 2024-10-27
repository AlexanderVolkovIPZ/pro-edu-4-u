'use client';
import { createContext, useEffect, useState } from 'react';

type AccountContextType = {
  locale: string[];
  setLocale: (locale: string[]) => void;
};

export const AccountContext = createContext<AccountContextType>({
  locale: ['en'],
  setLocale: () => {},
});

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState(['en']);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.languages) {
      setLocale(Array.from(navigator.languages));
    }
  }, []);

  return <AccountContext.Provider value={{ locale, setLocale }}>{children}</AccountContext.Provider>;
};
