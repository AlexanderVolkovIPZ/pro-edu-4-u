import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import MobileSidebarList from './mobile-sidebar-list';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon' className='md:hidden'>
          <MenuIcon className='h-5 w-5' />
          <span className='sr-only'>Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='max-w-60 sm:max-w-60'>
        <SheetHeader className='hidden'>
          <SheetTitle></SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <MobileSidebarList />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
