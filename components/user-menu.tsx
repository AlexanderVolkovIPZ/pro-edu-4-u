import { CircleUser, LogOut, Menu, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import Avatar from './avatar';
import { Separator } from '@/components/ui/separator';
import UserItemMenu from './user-item-menu';
import { signOut } from 'next-auth/react';

type UserMenuProps = {
  url?: string | null;
  email?: string | null;
};

const UserMenu = ({ url, email }: UserMenuProps) => {
  return (
    <Popover>
      <PopoverTrigger className='flex items-center gap-x-2 px-2 py-1 border-[1px] border-slate-300  rounded-full transition hover:shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]'>
        <Menu width={20} height={20} />
        <Avatar url={url ?? 'https://avatar.iran.liara.run/public'} width={26} height={26} />
      </PopoverTrigger>
      <PopoverContent align='end' className='min-w-32 max-w-min p-1'>
        <div className='py-2 px-2'>
          <div className='text-sm font-medium'>My account</div>
          {email && <div className='text-[10px] text-slate-700 pt-1'>{email}</div>}
        </div>
        <Separator />
        <UserItemMenu label='Profile' onClick={() => {}} icon={CircleUser} />
        <UserItemMenu label='Settings' icon={Settings} onClick={() => {}} />
        <Separator />
        <UserItemMenu label='Log out' icon={LogOut} onClick={() => signOut({})} />
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;
