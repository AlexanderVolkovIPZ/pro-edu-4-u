'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  isButtonDisabled: boolean;
  onBtnClick: () => void;
};

const Header = ({ isButtonDisabled = true, onBtnClick }: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('auction.auction_setup')}</h5>
      <Button variant='outline' disabled={isButtonDisabled} onClick={onBtnClick}>
        {t('auction.publish')}
      </Button>
    </div>
  );
};

export default Header;
