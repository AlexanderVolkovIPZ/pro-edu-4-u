'use client';

import Container from '@/components/container';
import Tabs from './_components/tabs';
import { Route, Routes } from 'react-router-dom';
import Profile from './_components/tab-pages/profile';
import Account from './_components/tab-pages/account';
import Header from './_components/tab-pages/header';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';

const SettingsPage = () => {
  const location = usePathname();

  console.log('PATH-NAME -> ', location);

  return (
    <div className='flex-grow'>
      <Container>
        <Header />
        <Separator className='my-6' />
        <div className='flex gap-x-6 flex-col md:flex-row'>
          <Tabs />
          <div className='w-full max-w-[700px] px-2 md:px-0'>
            <Routes location={location ?? ''}>
              <Route path='*' element={<Profile />} />
              <Route path='/settings/account' element={<Account />} />
            </Routes>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SettingsPage;
