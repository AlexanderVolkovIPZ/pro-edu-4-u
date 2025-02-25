import MenuBurger from '@/app/(public)/_components/menu-burger';
import { menuLinksList } from '@/app/(public)/_shared/lists/menu-links-list';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Header = () => {
  return (
    <header className='bg-card border-b border-gray-200'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex-shrink-0'>
            <Logo />
          </div>
          <MenuBurger />
          <nav className='hidden md:block space-x-8'>
            {menuLinksList.map(({ title, link }) => (
              <Link key={title} href={link} className='text-muted-foreground hover:text-gray-900'>
                {title}
              </Link>
            ))}
          </nav>
          <div className='hidden md:block items-center space-x-4'>
            <Button variant='ghost' asChild>
              <Link href='/sign-in'>Sign In</Link>
            </Button>
            <Button variant='default' asChild>
              <Link href='/sign-up'>Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
