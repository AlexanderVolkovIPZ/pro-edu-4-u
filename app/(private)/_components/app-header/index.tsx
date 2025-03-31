'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { useBidsByFilter } from '@/app/queries/bid';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/user-menu';
import { ShoppingBasket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import MobileSidebar from './mobile-sidebar';

const AppHeader = () => {
  const authUser = useContext(AuthUserContext);
  const router = useRouter();

  const { data: bidsData = [], isFetched: isFetchedBids } = useBidsByFilter(
    {
      bidderId: authUser?.id,
      isWinner: true,
      isPaid: false,
    },
    {
      enabled: !!authUser?.id,
      staleTime: 1000 * 60,
    }
  );

  return (
    <header className='bg-card border-b border-gray-200'>
      <div className='px-6 h-16 flex items-center'>
        <div className='block sm:hidden'>
          <MobileSidebar />
        </div>
        <div className='ml-auto flex items-centers gap-x-4'>
          <div className='flex items-center'>
            <Button variant='link' size='icon' className='relative' onClick={() => router.push('/won-lots')}>
              <ShoppingBasket className='h-6 w-6 hover:scale-110 transition-all text-slate-700' />

              <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                {isFetchedBids ? bidsData.length : 0}
              </span>
            </Button>
          </div>
          <UserMenu url={authUser?.image} email={authUser?.email} />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
