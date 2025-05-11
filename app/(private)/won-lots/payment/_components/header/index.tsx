'use client';

import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between mb-8'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('checkout.checkout')}</h5>
      <div className='flex items-center gap-2 text-rose-500'>
        <Clock size={20} />
        <span className='text-sm'>
          {t('checkout.completion_time')}: ~2 {t('checkout.min')}
        </span>
      </div>
    </div>
  );
};

export default Header;
