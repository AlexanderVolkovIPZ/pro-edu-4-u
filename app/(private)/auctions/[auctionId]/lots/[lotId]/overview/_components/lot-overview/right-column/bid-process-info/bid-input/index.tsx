import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MinusIcon, PlusIcon } from 'lucide-react';

export const BidInput = ({
  value,
  onChange,
  onIncrease,
  onDecrease,
  min,
}: {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncrease: () => void;
  onDecrease: () => void;
  min: number;
}) => (
  <div className='flex items-center justify-between'>
    <Button variant='outline' size='icon' onClick={onDecrease}>
      <MinusIcon className='h-4 w-4' />
    </Button>
    <Input type='number' value={value} onChange={onChange} className='text-center text-xl font-bold w-full' min={min} />
    <Button variant='outline' size='icon' onClick={onIncrease}>
      <PlusIcon className='h-4 w-4' />
    </Button>
  </div>
);
