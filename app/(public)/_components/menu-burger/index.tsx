import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';

const MenuBurger = ({ signInLabel, signUpLabel }: { signInLabel: string; signUpLabel: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon' className='md:hidden'>
          <MenuIcon className='h-6 w-6' />
        </Button>
      </SheetTrigger>
      <SheetContent side='right'>
        <nav className='flex flex-col items-center gap-y-5'>
          <SheetClose asChild>
            <Link href='/sign-in' className='text-muted-foreground hover:text-gray-900 text-2xl'>
              {signInLabel}
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href='/sign-up' className='text-muted-foreground hover:text-gray-900 text-2xl'>
              {signUpLabel}
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MenuBurger;
