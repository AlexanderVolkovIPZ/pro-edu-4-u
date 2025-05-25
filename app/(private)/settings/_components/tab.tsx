'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type TabProps = {
  title: string;
  path: string;
  isActive: boolean;
};

const Tab = ({ title, path, isActive }: TabProps) => {
  const { t } = useTranslation();

  return (
    <Link
      href={path}
      className={cn(
        ' px-2 py-1 rounded hover:scale-[1.015] transition w-36 text-slate-700',
        isActive && 'bg-slate-200/70',
        !isActive && 'hover:underline'
      )}
    >
      {t(`settings.${title}`)}
    </Link>
  );
};

export default Tab;
