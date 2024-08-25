import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className='bg-card border-t border-gray-200 py-4'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col md:flex-row items-center justify-between'>
          <div className='text-muted-foreground text-sm'>© 2024 ProEdu4U. All rights reserved.</div>
          <div className='flex space-x-6 mt-4 md:mt-0'>
            <Link href='/privacy-policy' className='text-muted-foreground hover:text-gray-900 flex items-center'>
              <span>Privacy Policy</span>
            </Link>
            <Link href='/terms-of-service' className='text-muted-foreground hover:text-gray-900 flex items-center'>
              <span>Terms of Service</span>
            </Link>
            <Link href='/contact-us' className='text-muted-foreground hover:text-gray-900 flex items-center'>
              <span>Contact Us</span>
            </Link>
          </div>
          <div className='flex space-x-4 mt-4 md:mt-0'>
            <Link
              href='https://facebook.com'
              aria-label='Facebook'
              className='text-muted-foreground hover:text-gray-900'
            >
              <Facebook className='h-5 w-5' />
            </Link>
            <Link href='https://twitter.com' aria-label='Twitter' className='text-muted-foreground hover:text-gray-900'>
              <Twitter className='h-5 w-5' />
            </Link>
            <Link
              href='https://instagram.com'
              aria-label='Instagram'
              className='text-muted-foreground hover:text-gray-900'
            >
              <Instagram className='h-5 w-5' />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
