'use client';

import { useCreatePhoto, useDeletePhoto, useReorderPhoto } from '@/app/queries/photo';
import { convertToBase64 } from '@/app/utils/convert-to-base64';
import { generateUUID } from '@/app/utils/generate-uuid';
import getReorderedFiles from '@/app/utils/get-reordered-files';
import { Button } from '@/components/ui/button';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from '@hello-pangea/dnd';
import { Photo } from '@prisma/client';
import { ImageIcon, Upload, X } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Spinner from './spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export type UploadedImage = {
  id: string;
  file: File;
  position: number;
  previewUrl: string;
  isImageUploaded: boolean;
  isLoading: boolean;
};

type ImageUploaderParams = {
  auctionId: string;
  lotId: string;
  images: Photo[];
  dropzoneOptions?: Omit<DropzoneOptions, 'onDrop'>;
};

const ImageUploader = ({ auctionId, lotId, images: existingImages, dropzoneOptions }: ImageUploaderParams) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const isAllImagesUploaded = images.every((image) => image.isImageUploaded);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: createPhoto } = useCreatePhoto(auctionId, lotId);
  const { mutateAsync: deletePhoto } = useDeletePhoto(auctionId, lotId);
  const { mutateAsync: reorderPhoto } = useReorderPhoto(auctionId, lotId);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setImages(
      existingImages.map((image) => ({
        id: image.id,
        file: new File([], image.name),
        previewUrl: image.url,
        position: image.position,
        isImageUploaded: true,
        isLoading: false,
      }))
    );
  }, [existingImages]);

  useEffect(() => {
    return () => images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  }, [images]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = acceptedFiles
        .filter((file) => !images.some((image) => image.file.name === file.name))
        .map((file, index) => ({
          id: generateUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          position: images.length + index + 1,
          isImageUploaded: false,
          isLoading: false,
        }));

      setImages((prev) => [...prev, ...newImages]);
    },
    [images]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    ...dropzoneOptions,
  });

  const removeImage = async (identifier: string) => {
    let imageToDelete: UploadedImage | undefined;

    setImages((prev) =>
      prev.map((image) => {
        if (image.id === identifier) {
          imageToDelete = { ...image, isLoading: true };
          return imageToDelete;
        }
        return image;
      })
    );

    const needRequestToDelete = !!imageToDelete?.isImageUploaded;

    if (imageToDelete && needRequestToDelete) {
      try {
        await deletePhoto({
          id: identifier,
        });

        toast.success(`The image ${imageToDelete.file.name} has been successfully deleted`, {
          style: {
            textAlign: 'center',
          },
        });
      } catch {
        toast.error('Something went wrong');
      }
    }

    setImages((prev) => {
      const newImages = prev.filter(({ id }) => id !== identifier);

      if (imageToDelete?.previewUrl) {
        URL.revokeObjectURL(imageToDelete.previewUrl);
      }

      return newImages;
    });
  };

  const uploadImages = async () => {
    try {
      setIsUploading(true);

      const data = await Promise.all(
        images.map(async ({ id, file, position, isImageUploaded }) => ({
          file: await convertToBase64(file),
          position,
          name: file.name,
          isFileUploaded: isImageUploaded,
          id,
        }))
      );

      await createPhoto(data);

      const newImagesLength = data.filter(({ isFileUploaded }) => !isFileUploaded).length;
      toast.success(`Successfully uploaded ${newImagesLength} image${newImagesLength > 1 ? 's' : ''}.`, {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      setIsUploading(false);
      toast.error('Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const reorderedFiles = getReorderedFiles({ id: draggableId, files: images, newPosition: destination.index });
    setImages(reorderedFiles);

    const hasNewImages = reorderedFiles.some(({ isImageUploaded }) => !isImageUploaded);

    if (hasNewImages) return;

    setImages((prevImages) =>
      prevImages.map((image) => (image.id === draggableId ? { ...image, isLoading: true } : image))
    );

    try {
      await reorderPhoto({ id: draggableId, position: destination.index });

      toast.success('The image position has been successfully updated', {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      toast.error('Something went wrong');
    } finally {
      setImages((prevImages) =>
        prevImages.map((image) => ({
          ...image,
          isLoading: false,
        }))
      );
    }
  };

  const onMouseEvent = (e: Event) => {
    e.preventDefault();
  };

  const onMouseOver = () => {
    window.addEventListener('wheel', onMouseEvent, { passive: false });
    window.addEventListener('touchmove', onMouseEvent, { passive: false });
  };

  const onMouseLeave = () => {
    window.removeEventListener('wheel', onMouseEvent);
    window.removeEventListener('touchmove', onMouseEvent);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      e.preventDefault();
      const scrollAmount = e.deltaY > 0 ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className='w-full max-w-md mx-auto space-y-3'>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <ImageIcon className='mx-auto h-12 w-12 text-gray-400' />
        <p className='mt-2 text-sm text-gray-600'>Drag and drop some images here, or click to select images</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='images' direction='horizontal'>
          {(provided: DroppableProvided) => (
            <div
              ref={(el) => {
                provided.innerRef(el);
                scrollRef.current = el;
              }}
              onWheel={onWheel}
              onMouseOver={onMouseOver}
              onMouseLeave={onMouseLeave}
              {...provided.droppableProps}
              className='flex flex-nowrap gap-2 justify-start overflow-x-scroll p-1 scrollbar-none'
            >
              {images.map(({ id, file, previewUrl, position, isLoading }) => (
                <Draggable key={file.name} draggableId={id} index={position}>
                  {(provided: DraggableProvided) => (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className='relative'
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className='w-16 h-16 relative'>
                              {isLoading && (
                                <>
                                  <div className='absolute inset-0 bg-slate-500 opacity-50 rounded-lg'></div>
                                  <div className='absolute inset-0 flex items-center justify-center'>
                                    <Spinner color='text-slate-200' />
                                  </div>
                                </>
                              )}
                              <CldImage
                                width={64}
                                height={64}
                                src={previewUrl}
                                alt={`Preview ${file.name}`}
                                quality={100}
                                className='w-full h-full object-cover rounded-lg duration-300 hover:scale-[1.06]'
                              />
                            </div>

                            <Button
                              variant='destructive'
                              size='icon'
                              className='absolute -top-1 -right-1 h-5 w-5'
                              onClick={() => removeImage(id)}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{file.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {images.length > 0 && (
        <div className='space-y-4'>
          <Button onClick={uploadImages} disabled={isUploading || isAllImagesUploaded} className='w-full'>
            {isUploading ? (
              <div className='flex items-center justify-center'>
                <Spinner />
              </div>
            ) : (
              <div className='flex items-center'>
                {`Upload Image${images.length > 1 ? 's' : ''}`}
                <Upload className='ml-2 h-4 w-4' />
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
