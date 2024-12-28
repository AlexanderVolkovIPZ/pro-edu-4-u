'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import UserMenu from '@/components/user-menu';
import { useContext } from 'react';
import MobileSidebar from './mobile-sidebar';

const AppHeader = () => {
  const authUser = useContext(AuthUserContext);

  return (
    <header className='bg-card border-b border-gray-200'>
      <div className='px-6 h-16 flex items-center'>
        <div className='block sm:hidden'>
          <MobileSidebar />
        </div>
        <div className='ml-auto'>
          <UserMenu url={authUser?.image} email={authUser?.email} />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
