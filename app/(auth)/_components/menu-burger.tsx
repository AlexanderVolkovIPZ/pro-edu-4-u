import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { menuLinksList } from '../_shared/menu-links-list';

const MenuBurger = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon' className='md:hidden'>
          <MenuIcon className='h-6 w-6' />
          <span className='sr-only'>Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='right'>
        <nav className='flex flex-col items-center gap-y-5'>
          {menuLinksList.map(({ title, link }) => (
            <SheetClose asChild key={title}>
              <Link href={link} className='text-muted-foreground hover:text-gray-900 text-2xl'>
                {title}
              </Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Link href='/sign-in' className='text-muted-foreground hover:text-gray-900 text-2xl'>
              Sign In
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href='/sign-up' className='text-muted-foreground hover:text-gray-900 text-2xl'>
              Sign Up
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MenuBurger;
