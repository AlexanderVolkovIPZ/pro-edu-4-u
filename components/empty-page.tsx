import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type EmptyTableProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonTitle: string;
  className?: string;
  onClick: () => void;
};

const EmptyPage = ({ icon: Icon, title, description, buttonTitle, className = '', onClick }: EmptyTableProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center mt-20', className)}>
      <Icon className='w-12 h-12 text-gray-400 animate-bounce' />

      <h1 className='mt-4 text-3xl font-semibold text-gray-700'>{title}</h1>
      <p className='mt-2 text-gray-500'>{description}</p>

      <Button variant='link' className='text-rose-500' onClick={onClick}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default EmptyPage;
