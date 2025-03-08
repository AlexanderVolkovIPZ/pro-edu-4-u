'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import Logo from '@/components/logo';
import { useContext } from 'react';
import { adminSidebarList, userSidebarList } from '../../_shared/lists/sidebar-list';
import SidebarList from './sidebar-list';

const Sidebar = () => {
  const authUser = useContext(AuthUserContext);
  const sidebarList = authUser?.role === 'ADMIN' ? adminSidebarList : userSidebarList;

  return (
    <div className='h-full border-r'>
      <div className='h-16 flex items-center justify-center'>
        <Logo />
      </div>
      <div>
        <SidebarList sidebarList={sidebarList} />
      </div>
    </div>
  );
};

export default Sidebar;
