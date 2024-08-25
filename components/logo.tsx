import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href='/' className='flex items-center'>
      <GraduationCap className='h-8 w-8 text-indigo-500' />
      <span className='ml-2 text-xl font-bold'>
        <span className='text-indigo-500'>Pro</span>
        <span className='text-rose-500'>Edu</span>
        <span className='text-teal-500'>4</span>
        <span className='text-orange-500'>U</span>
      </span>
    </Link>
  );
};

export default Logo;
