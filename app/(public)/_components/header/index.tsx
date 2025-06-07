'use client';

import MenuBurger from '@/app/(public)/_components/menu-burger';
import LanguageSwitcher from '@/app/_components/LanguageSwitcher';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className='bg-card border-b border-gray-200'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex-shrink-0'>
            <Logo />
          </div>
          <MenuBurger signInLabel={t('common.sign_in_header')} signUpLabel={t('common.sign_up_header')} />
          <div className='hidden md:flex items-center gap-x-2'>
            <LanguageSwitcher />
            <Button variant='ghost' asChild>
              <Link href='/sign-in'>{t('common.sign_in_header')}</Link>
            </Button>
            <Button variant='default' asChild>
              <Link href='/sign-up'>{t('common.sign_up_header')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
