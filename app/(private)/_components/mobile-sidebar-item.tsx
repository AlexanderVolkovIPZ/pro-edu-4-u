import { SheetClose } from '@/components/ui/sheet';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

type SidebarItemProps = {
  link: string;
  name: string;
  icon: LucideIcon;
};

const MobileSidebarItem = ({ link, name, icon: Icon }: SidebarItemProps) => {
  return (
    <SheetClose asChild>
      <Link href={link} className='flex gap-x-2 items-center py-2'>
        <div className='flex-shrink-0'>
          <Icon width={25} height={25} className='text-slate-700' />
        </div>
        <div className='text-xl text-slate-700'>{name}</div>
      </Link>
    </SheetClose>
  );
};

export default MobileSidebarItem;
