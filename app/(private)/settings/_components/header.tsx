'use client';

import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className='space-y-0.5'>
        <h1 className='text-2xl font-bold tracking-tight text-rose-500'>{t('settings.settings')}</h1>
        <p className='text-muted-foreground'>{t('settings.settings_description')}</p>
      </div>
    </>
  );
};

export default Header;
