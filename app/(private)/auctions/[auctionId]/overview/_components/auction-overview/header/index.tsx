'use client';

import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('auction_lots.auction_lots')}</h5>
    </div>
  );
};

export default Header;
