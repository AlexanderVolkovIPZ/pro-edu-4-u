'use client';

import { useTranslation } from 'react-i18next';
import TabPageHeader from './_shared/tab-page-header';

const Profile = () => {
  const { t } = useTranslation();

  return (
    <div>
      <TabPageHeader title={t('settings.profile')} description={t('settings.update_your_profile_settings')} />
    </div>
  );
};

export default Profile;
