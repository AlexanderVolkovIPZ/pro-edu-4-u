import { Button } from '@/components/ui/button';

type HeaderProps = {
  isButtonDisabled: boolean;
  onBtnClick: () => void;
};
const Header = ({ isButtonDisabled = true, onBtnClick }: HeaderProps) => {
  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>Auction setup</h5>
      <Button variant='outline' disabled={isButtonDisabled} onClick={onBtnClick}>
        Publish
      </Button>
    </div>
  );
};

export default Header;
