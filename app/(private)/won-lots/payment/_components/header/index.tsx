import { Clock } from 'lucide-react';

const Header = () => {
  return (
    <div className='flex items-center justify-between mb-8'>
      <h5 className='text-rose-500 text-3xl font-bold'>Checkout</h5>
      <div className='flex items-center gap-2 text-rose-500'>
        <Clock size={20} />
        <span className='text-sm'>Completion time: ~2 min</span>
      </div>
    </div>
  );
};

export default Header;
