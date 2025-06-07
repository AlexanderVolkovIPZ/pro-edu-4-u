'use client';

import { Separator } from '@/components/ui/separator';
import { LogOut, Menu, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Avatar from './avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import UserItemMenu from './user-item-menu';
import { useRouter } from 'next/navigation';

type UserMenuProps = {
  url?: string | null;
  email?: string | null;
};

const UserMenu = ({ url, email }: UserMenuProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger className='flex items-center gap-x-2 px-2 py-1 border-[1px] border-slate-300  rounded-full transition hover:shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]'>
        <Menu width={20} height={20} />
        <Avatar url={url} width={26} height={26} />
      </PopoverTrigger>
      <PopoverContent align='end' className='min-w-32 max-w-min p-1'>
        <div className='py-2 px-2'>
          <div className='text-sm font-medium'>{t('avatar_menu.my_account')}</div>
          {email && <div className='text-[10px] text-slate-700 pt-1'>{email}</div>}
        </div>
        <Separator />
        <UserItemMenu
          label={t('avatar_menu.settings')}
          icon={Settings}
          onClick={() => router.push('/settings/account')}
        />
        <Separator />
        <UserItemMenu label={t('avatar_menu.log_out')} icon={LogOut} onClick={() => signOut({})} />
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;
