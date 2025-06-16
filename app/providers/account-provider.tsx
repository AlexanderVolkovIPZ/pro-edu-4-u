'use client';
import { createContext, useEffect, useState } from 'react';

const DEFAULT_LOCALE = 'uk-UA';
const DEFAULT_TIME_ZONE = 'Europe/Kyiv';
export const SUPPORTED_LOCALES = ['en-US', 'uk-UA', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pl-PL', 'zn-CN', 'ja-JP'];

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
      const localesAndLanguages = navigator.languages;

      const isUkrainian = localesAndLanguages.find((item) => ['uk', 'uk-UA'].includes(item));
      if (isUkrainian) {
        setLocale(DEFAULT_LOCALE);
        return;
      }

      const matchedLocale = navigator.languages.find((locale) => SUPPORTED_LOCALES.includes(locale)) || DEFAULT_LOCALE;
      setLocale(matchedLocale);
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
