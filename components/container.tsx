import { cn } from '@/lib/utils';

const Container = ({ children, className: classNameCustom }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('lg:px-10 md:px-8 sm:px-6 px-4 py-4', classNameCustom && classNameCustom)}>{children}</div>;
};

export default Container;
