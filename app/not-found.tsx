import Link from 'next/link';
import { FrownIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-white'>
      <div className='text-center'>
        <FrownIcon className='mx-auto h-16 w-16 text-rose-500 mb-4 animate-bounce' />
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>404 - Page Not Found</h1>
        <p className='text-xl text-gray-600 mb-8'>Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href='/'
          className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-300'
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
