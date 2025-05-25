import { Slider } from '@/components/ui/slider';
import { BID_INCREMENT_STORAGE_KEY } from '../_shared/constants';

type BidIncrementSliderProps = {
  label: string;
  minBidIncrement: number;
  maxBidIncrement: number;
  bidIncrement: number;
  setBidIncrement: (value: number) => void;
};

export const BidIncrementSlider = ({
  label,
  minBidIncrement,
  maxBidIncrement,
  bidIncrement,
  setBidIncrement,
}: BidIncrementSliderProps) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
    <Slider
      min={minBidIncrement}
      max={maxBidIncrement}
      value={[bidIncrement]}
      onValueChange={(value) => {
        setBidIncrement(value[0]);
        localStorage.setItem(BID_INCREMENT_STORAGE_KEY, value[0].toString());
      }}
      className='w-full'
    />
    <div className='flex justify-between text-sm text-gray-500 mt-1'>
      <span>${minBidIncrement}</span>
      <span>${bidIncrement}</span>
      <span>${minBidIncrement * 5}</span>
    </div>
  </div>
);
