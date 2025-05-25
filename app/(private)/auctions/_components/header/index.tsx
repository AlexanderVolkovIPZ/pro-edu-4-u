'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center gap-x-2'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('all_auctions.auction_managment')}</h5>
      <Button onClick={() => router.push('/auctions/create')}>
        <PlusCircle className='mr-2 h-4 w-4' /> {t('all_auctions.new_auction')}
      </Button>
    </div>
  );
};

export default Header;
