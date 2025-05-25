'use client';

import { useTranslation } from 'react-i18next';

const Appearance = () => {
  const { t } = useTranslation();

  return <div>{t('settings.appearance')}</div>;
};

export default Appearance;
