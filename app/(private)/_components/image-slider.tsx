'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageSliderProps = {
  images: string[];
  alt: string;
};

export function ImageSlider({ images, alt }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const onPrevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className='relative overflow-hidden rounded-t-lg group'>
      <Image src={images[currentIndex]} alt={alt} width={300} height={300} className='aspect-video' />

      <Button
        onClick={onPrevSlide}
        variant='link'
        size='icon'
        className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 h-8 w-8'
      >
        <ChevronLeft size={24} />
      </Button>

      <Button
        onClick={onNextSlide}
        variant='link'
        size='icon'
        className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 h-8 w-8'
      >
        <ChevronRight size={24} />
      </Button>

      <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2'>
        {images.slice(0, 5).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors cursor-pointer',
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
