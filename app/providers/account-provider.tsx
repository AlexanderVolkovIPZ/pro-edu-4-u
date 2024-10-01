'use client';
import { createContext, useEffect, useState } from 'react';

type Mode = 'teacher' | 'student';
type AccountContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const getInitialMode = (): Mode => {
  if (typeof window === 'undefined') {
    return 'student';
  }

  const storedMode = localStorage.getItem('mode') as Mode;
  return ['teacher', 'student'].includes(storedMode) ? storedMode : 'student';
};

export const AccountContext = createContext<AccountContextType>({
  mode: 'student',
  setMode: () => {},
});

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>(getInitialMode);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode', mode);
    }
  }, [mode]);

  return <AccountContext.Provider value={{ mode, setMode }}>{children}</AccountContext.Provider>;
};
