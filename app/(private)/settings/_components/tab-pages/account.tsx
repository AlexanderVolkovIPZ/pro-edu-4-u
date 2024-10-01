'use client';

import { Switch } from '@/components/ui/switch';
import TabPageHeader from './_shared/tab-page-header';
import { Label } from '@/components/ui/label';
import { AccountContext } from '@/app/providers/account-provider';
import { useContext } from 'react';
import { capitalize } from '@/app/utils/capitalize';

const Account = () => {
  const { mode, setMode } = useContext(AccountContext);

  return (
    <div>
      <TabPageHeader title='Account' description='Updated your account settings' />

      <div className='flex-col items-center py-5'>
        <div className='flex items-center gap-x-3'>
          <Switch
            id='account-mode'
            checked={mode === 'teacher'}
            onCheckedChange={(checked) => {
              if (checked) {
                setMode('teacher');
              } else {
                setMode('student');
              }
            }}
          />
          <Label htmlFor='account-mode' className='text-slate-500'>
            {capitalize(mode)} mode
          </Label>
        </div>
      </div>
    </div>
  );
};

export default Account;
