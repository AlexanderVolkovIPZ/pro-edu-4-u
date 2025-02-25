'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarItemProps = {
  link: string;
  name: string;
  icon: LucideIcon;
};

const SidebarItem = ({ link, name, icon: Icon }: SidebarItemProps) => {
  const pathName = usePathname();
  const isActive = pathName === link || pathName?.startsWith(`${link}/`);

  return (
    <Link
      href={link}
      className={cn(
        'flex px-3 gap-x-3 items-center py-2 hover:scale-[1.015] transition',
        isActive && 'bg-violet-100 border-r-4 border-r-violet-500',
        !isActive && 'hover:bg-slate-100/80'
      )}
    >
      <Icon width={18} height={18} className={cn('text-slate-700', isActive && 'text-violet-500')} />
      <div className={cn('text-base text-slate-700', isActive && 'text-violet-500')}>{name}</div>
    </Link>
  );
};

export default SidebarItem;
