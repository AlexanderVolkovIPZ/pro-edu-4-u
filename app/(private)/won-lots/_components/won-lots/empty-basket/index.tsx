import { Button } from '@/components/ui/button';
import { ShoppingBasket } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EmptyBasket = () => {
  const router = useRouter();

  return (
    <div className='flex flex-col items-center justify-center text-center mt-20'>
      <ShoppingBasket className='w-12 h-12 text-gray-400 animate-bounce' />

      <h1 className='mt-4 text-3xl font-semibold text-gray-700'>Your Basket is Empty</h1>
      <p className='mt-2 text-gray-500'>Looks like you haven’t added anything yet.</p>

      <Button variant='link' className='text-rose-500' onClick={() => router.push('/')}>
        Go to Auctions
      </Button>
    </div>
  );
};

export default EmptyBasket;
