'use client';

import { adminSidebarList, userSidebarList } from '@/app/(private)/_shared/lists/sidebar-list';
import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

type SidebarItemProps = {
  link: string;
  name: string;
  icon: LucideIcon;
};

const SidebarItem = ({ link, name, icon: Icon }: SidebarItemProps) => {
  const authUser = useContext(AuthUserContext);
  const pathName = usePathname();
  const firstPart = '/' + pathName?.split('/')[1];
  const sidebarList = authUser?.role === 'ADMIN' ? adminSidebarList : userSidebarList;
  const matchedItem = sidebarList.find(({ link }) => firstPart === link || pathName?.startsWith(`${link}/`));
  const activeItem = matchedItem || sidebarList[0];
  const isActive = activeItem.link === link;

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
