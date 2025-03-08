import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useMemo } from 'react';

type CardProps = {
  title: string;
  growth: number;
  totalCount: number;
  index: number;
};

const gradientColors = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-red-400 to-red-600',
  'from-orange-400 to-orange-600',
  'from-teal-400 to-teal-600',
  'from-pink-400 to-pink-600',
  'from-yellow-400 to-yellow-600',
  'from-indigo-400 to-indigo-600',
  'from-cyan-400 to-cyan-600',
];

const Card = ({ title, growth, totalCount, index }: CardProps) => {
  const isPositiveGrowth = growth >= 0;
  const growthArrow = isPositiveGrowth ? (
    <ArrowUpRight className='ml-1 w-3 h-3' />
  ) : (
    <ArrowDownRight className='ml-1 w-3 h-3' />
  );

  const randomGradient = useMemo(() => gradientColors[index % gradientColors.length], [index]);

  return (
    <div className='bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]'>
      <div className='flex justify-between items-start'>
        <h2 className='text-gray-500 font-medium'>{title}</h2>
        <div className='bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-1 rounded-full flex items-center'>
          {isPositiveGrowth && '+'}
          {growth.toFixed(1)}% {growthArrow}
        </div>
      </div>
      <p className='text-4xl font-bold text-gray-800 mt-3'>{totalCount}</p>
      <div className={`h-1 w-16 bg-gradient-to-r ${randomGradient} rounded-full mt-4`}></div>
    </div>
  );
};

export default Card;
