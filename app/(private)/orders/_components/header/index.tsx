'use client';

import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center gap-x-2'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('orders.orders')}</h5>
    </div>
  );
};

export default Header;
