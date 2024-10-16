'use client';

import Container from '@/components/container';

import { Separator } from '@/components/ui/separator';
import Tabs from './_components/tabs';
import Header from './_components/header';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex-grow'>
      <Container>
        <Header />
        <Separator className='my-6' />
        <div className='flex gap-x-6 flex-col md:flex-row'>
          <Tabs />
          <div className='w-full max-w-[700px] px-2 md:px-0'>{children}</div>
        </div>
      </Container>
    </div>
  );
};

export default SettingsLayout;
