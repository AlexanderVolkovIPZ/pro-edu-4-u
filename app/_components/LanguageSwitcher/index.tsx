'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const supportedLanguages = ['en', 'ua'];
  const currentLang = i18n.language.split('-')[0];
  const displayLang = supportedLanguages.includes(currentLang) ? currentLang.toUpperCase() : 'UA';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center gap-1 px-2 border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none'
        >
          <Globe className='h-4 w-4' />
          <span>{displayLang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-24'>
        <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className='cursor-pointer font-medium'>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage('ua')} className='cursor-pointer font-medium'>
          Українська
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default LanguageSwitcher;
