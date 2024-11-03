'use client';
import { createContext, useEffect, useState } from 'react';

const DEFAULT_LOCALE = 'en';
const DEFAULT_TIME_ZONE = 'Europe/Kyiv';

type AccountContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  timeZone: string;
  setTimeZone: (timeZone: string) => void;
};

export const AccountContext = createContext<AccountContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  timeZone: DEFAULT_TIME_ZONE,
  setTimeZone: () => {},
});

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.languages) {
      setLocale(navigator.languages[0] || DEFAULT_LOCALE);
    }
  }, []);

  useEffect(() => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (userTimeZone) {
      setTimeZone(userTimeZone);
    }
  }, []);

  return (
    <AccountContext.Provider value={{ locale, setLocale, timeZone, setTimeZone }}>{children}</AccountContext.Provider>
  );
};
