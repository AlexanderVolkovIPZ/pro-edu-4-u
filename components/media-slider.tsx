'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image, { ImageProps } from 'next/image';
import { DetailedHTMLProps, HTMLAttributes, useState, VideoHTMLAttributes } from 'react';

export type Media = {
  type: 'image' | 'video';
  src: string;
};

export type MediaSliderProps = {
  media: Media[];
  alt: string;
  imageProps?: Omit<ImageProps, 'alt' | 'src'>;
  videoProps?: Omit<DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>, 'src'>;
  sliderProps?: HTMLAttributes<HTMLDivElement>;
  maxCountMediaToRender?: number;
  showNavigationDots?: boolean;
};

export function MediaSlider({
  media: acceptedMedia,
  alt,
  imageProps,
  videoProps,
  sliderProps,
  maxCountMediaToRender = acceptedMedia.length,
  showNavigationDots = true,
}: MediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { className, ...otherSliderProps } = sliderProps || {};
  const media = acceptedMedia.slice(0, maxCountMediaToRender);

  const onNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const onPrevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  const renderMedia = (currentMedia: Media) => {
    if (currentMedia?.type === 'image') {
      return <Image {...imageProps} src={currentMedia.src} alt={alt} className='aspect-video object-cover' />;
    } else if (currentMedia?.type === 'video') {
      return <video {...videoProps} src={currentMedia.src} controls className='aspect-video object-cover' />;
    }

    return <Image {...imageProps} src={currentMedia?.src} alt={alt} className='aspect-video object-cover' />;
  };

  return (
    <div className={cn('relative overflow-hidden group w-fit h-fit mx-auto', className)} {...otherSliderProps}>
      {renderMedia(media[currentIndex])}

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

      {showNavigationDots && media.length > 1 && (
        <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2'>
          {media.slice(0, maxCountMediaToRender).map((_, index) => (
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
      )}
    </div>
  );
}
