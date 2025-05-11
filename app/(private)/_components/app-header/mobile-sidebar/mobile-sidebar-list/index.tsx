'use client';

import { adminSidebarList, userSidebarList } from '@/app/(private)/_shared/lists/sidebar-list';
import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import MobileSidebarItem from './mobile-sidebar-item';

const MobileSidebarList = () => {
  const authUser = useContext(AuthUserContext);
  const { t } = useTranslation();

  const sidebarList = authUser?.role === 'ADMIN' ? adminSidebarList : userSidebarList;

  return (
    <div className='flex flex-col gap-y-2'>
      {sidebarList.map(({ link, name, icon }) => (
        <MobileSidebarItem key={link} link={link} name={t(name)} icon={icon} />
      ))}
    </div>
  );
};

export default MobileSidebarList;
