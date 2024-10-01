'use client';

import Footer from '@/app/(private)/_components/footer';
import Header from '@/app/(private)/_components/header';
import Sidebar from '@/app/(private)/_components/sidebar';
import { redirect } from 'next/navigation';
import { useContext } from 'react';
import { AuthUserContext } from '../providers/auth-user-provider';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  const authUser = useContext(AuthUserContext);

  if (!authUser) {
    redirect('/sign-in');
  }
  return (
    <div className='flex flex-col min-h-screen'>
      <div className='fixed h-20 w-full sm:pl-40'>
        <Header />
      </div>
      <div className='fixed h-full w-40 hidden sm:block'>
        <Sidebar />
      </div>
      <div className='flex flex-1 mt-20 sm:ml-40'>{children}</div>
      <div className='ml-40'>
        <Footer />
      </div>
    </div>
  );
};

export default HomeLayout;
