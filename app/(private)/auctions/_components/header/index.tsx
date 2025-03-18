'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();

  return (
    <div className='flex justify-between items-center gap-x-2'>
      <h5 className='text-rose-500 text-3xl font-bold'>Auction Management</h5>
      <Button onClick={() => router.push('/auctions/create')}>
        <PlusCircle className='mr-2 h-4 w-4' /> New Auction
      </Button>
    </div>
  );
};

export default Header;
