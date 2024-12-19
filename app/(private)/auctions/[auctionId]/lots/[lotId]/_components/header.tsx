import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>Lot setup</h5>
      <Button variant='outline'>Publish</Button>
    </div>
  );
};

export default Header;
