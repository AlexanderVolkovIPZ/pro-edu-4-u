'use client';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();

  return (
    <CardHeader className='p-0'>
      <div className='flex justify-between items-center'>
        <CardTitle>Auction Management</CardTitle>
        <Button onClick={() => router.push('/auctions/create')}>
          <PlusCircle className='mr-2 h-4 w-4' /> New Auction
        </Button>
      </div>
    </CardHeader>
  );
};

export default Header;
