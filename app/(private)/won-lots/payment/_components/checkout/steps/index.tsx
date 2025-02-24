import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type TypeStepsProps = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
};
const Steps = ({ currentStep, setCurrentStep }: TypeStepsProps) => {
  return (
    <div className='flex justify-between mb-8'>
      {[1, 2, 3].map((step) => (
        <div key={step} className={cn('flex items-center', step < 3 && 'flex-1')}>
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300',
              currentStep >= step ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-500'
            )}
            onClick={() => step < currentStep && setCurrentStep(step)}
          >
            {currentStep > step ? <Check size={16} /> : step}
          </div>

          {step < 3 && (
            <div
              className={cn(
                'flex-1 h-1 mx-2 transition-all duration-300',
                currentStep > step ? 'bg-rose-500' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Steps;
