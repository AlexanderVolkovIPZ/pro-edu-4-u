'use client';

import { MediaKind, MediaRecord } from '@/app/_shared/types/media';
import { useMediaMutations } from '@/app/queries/media';
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
import { ImageIcon, LucideIcon, Pause, Play, Upload, VideoIcon, X } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Spinner from './spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export type UploadedMedia = {
  id: string;
  file: File;
  position: number;
  previewUrl: string;
  isUploaded: boolean;
  isLoading: boolean;
};

/** Texts and icon that differ between media kinds. */
const MEDIA_UI: Record<
  MediaKind,
  { icon: LucideIcon; dropHint: string; one: string; many: string; uploadOne: string; uploadMany: string }
> = {
  photo: {
    icon: ImageIcon,
    dropHint: 'common.drag_and_drop_some_images_here',
    one: 'toast.success.image',
    many: 'toast.success.images',
    uploadOne: 'new_lot.image',
    uploadMany: 'new_lot.images',
  },
  video: {
    icon: VideoIcon,
    dropHint: 'common.drag_and_drop_some_videos_here',
    one: 'toast.success.video',
    many: 'toast.success.videos',
    uploadOne: 'new_lot.video',
    uploadMany: 'new_lot.videos',
  },
};

const centered = { style: { textAlign: 'center' as const } };

type MediaUploaderProps = {
  kind: MediaKind;
  auctionId: string;
  lotId: string;
  items: MediaRecord[];
  dropzoneOptions?: Omit<DropzoneOptions, 'onDrop'>;
};

/**
 * Drag-and-drop uploader with reordering for a lot's photos or videos. The
 * kind only changes the preview and the texts; the behaviour is shared.
 */
const MediaUploader = ({ kind, auctionId, lotId, items: existingItems, dropzoneOptions }: MediaUploaderProps) => {
  const { t } = useTranslation();
  const ui = MEDIA_UI[kind];

  const { create, remove, reorder } = useMediaMutations(kind, auctionId, lotId);

  const [items, setItems] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const isAllUploaded = items.every((item) => item.isUploaded);

  useEffect(() => {
    setItems(
      existingItems.map((item) => ({
        id: item.id,
        file: new File([], item.name),
        previewUrl: item.url,
        position: item.position,
        isUploaded: true,
        isLoading: false,
      }))
    );
  }, [existingItems]);

  useEffect(() => {
    return () => items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }, [items]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newItems = acceptedFiles
        .filter((file) => !items.some((item) => item.file.name === file.name))
        .map((file, index) => ({
          id: generateUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          position: items.length + index + 1,
          isUploaded: false,
          isLoading: false,
        }));

      setItems((prev) => [...prev, ...newItems]);
    },
    [items]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, ...dropzoneOptions });

  const setLoading = (id: string | null, isLoading: boolean) =>
    setItems((prev) => prev.map((item) => (id === null || item.id === id ? { ...item, isLoading } : item)));

  const removeItem = async (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;

    if (item.isUploaded) {
      setLoading(id, true);
      try {
        await remove.mutateAsync({ id });
        toast.success(
          t('toast.success.the_media_has_been_successfully_deleted', { mediaType: t(ui.one), name: item.file.name }),
          centered
        );
      } catch {
        toast.error(t('toast.error.something_went_wrong'));
      }
    }

    URL.revokeObjectURL(item.previewUrl);
    setItems((prev) => prev.filter((candidate) => candidate.id !== id));
  };

  const uploadItems = async () => {
    try {
      setIsUploading(true);

      const data = await Promise.all(
        items.map(async ({ id, file, position, isUploaded }) => ({
          id,
          file: await convertToBase64(file),
          position,
          name: file.name,
          isFileUploaded: isUploaded,
        }))
      );

      await create.mutateAsync(data);

      const newCount = data.filter(({ isFileUploaded }) => !isFileUploaded).length;
      toast.success(
        t('toast.success.successfully_uploaded_media', {
          count: newCount,
          mediaType: newCount > 1 ? t(ui.many) : t(ui.one),
        }),
        centered
      );
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    } finally {
      setIsUploading(false);
    }
  };

  const onDragEnd = async ({ destination, draggableId }: DropResult) => {
    if (!destination) return;

    const reordered = getReorderedFiles({ id: draggableId, files: items, newPosition: destination.index });
    setItems(reordered);

    // Positions of not yet uploaded files are sent together with the upload.
    if (reordered.some(({ isUploaded }) => !isUploaded)) return;

    setLoading(draggableId, true);
    try {
      await reorder.mutateAsync({ id: draggableId, position: destination.index });
      toast.success(
        t('toast.success.the_media_position_has_been_successfully_updated', { mediaType: t(ui.one) }),
        centered
      );
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    } finally {
      setLoading(null, false);
    }
  };

  const togglePlay = (id: string) => {
    if (playingId === id) {
      videoRefs.current[id]?.pause();
      setPlayingId(null);
      return;
    }

    if (playingId !== null) {
      videoRefs.current[playingId]?.pause();
    }

    videoRefs.current[id]?.play();
    setPlayingId(id);
  };

  const preventScroll = (e: Event) => e.preventDefault();
  const onMouseOver = () => {
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
  };
  const onMouseLeave = () => {
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
  };
  const onWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollBy({ left: e.deltaY > 0 ? -200 : 200, behavior: 'smooth' });
    }
  };

  const renderPreview = ({ id, file, previewUrl, isLoading }: UploadedMedia) => (
    <div className='w-16 h-16 relative'>
      {kind === 'photo' ? (
        <CldImage
          width={64}
          height={64}
          src={previewUrl}
          alt={`Preview ${file.name}`}
          quality={100}
          className='w-full h-full object-cover rounded-lg duration-300 hover:scale-[1.06]'
        />
      ) : (
        <video
          className='w-full h-full object-cover rounded-lg duration-300 hover:scale-[1.06]'
          ref={(el) => {
            videoRefs.current[id] = el;
          }}
          src={previewUrl}
          controls={false}
          draggable={true}
        />
      )}

      {isLoading ? (
        <>
          <div className='absolute inset-0 bg-slate-500 opacity-50 rounded-lg'></div>
          <div className='absolute inset-0 flex items-center justify-center'>
            <Spinner color='text-slate-200' />
          </div>
        </>
      ) : (
        kind === 'video' && (
          <Button
            variant='secondary'
            size='icon'
            className='absolute inset-0 m-auto h-6 w-6 opacity-80 z-30'
            onClick={() => togglePlay(id)}
            draggable={true}
          >
            {playingId === id ? <Pause className='h-3 w-3' /> : <Play className='h-3 w-3' />}
          </Button>
        )
      )}
    </div>
  );

  return (
    <div className='w-full mx-auto space-y-3'>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <ui.icon className='mx-auto h-12 w-12 text-gray-400' />
        <p className='mt-2 text-sm text-gray-600'>{t(ui.dropHint)}</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`${kind}-items`} direction='horizontal'>
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
              {items.map((item) => (
                <Draggable key={item.id} draggableId={item.id} index={item.position}>
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
                            {renderPreview(item)}

                            <Button
                              variant='destructive'
                              size='icon'
                              className='absolute -top-1 -right-1 h-5 w-5'
                              onClick={() => removeItem(item.id)}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{item.file.name}</TooltipContent>
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

      {items.length > 0 && (
        <div className='space-y-4'>
          <Button onClick={uploadItems} disabled={isUploading || isAllUploaded} className='w-full'>
            {isUploading ? (
              <div className='flex items-center justify-center'>
                <Spinner />
              </div>
            ) : (
              <div className='flex items-center'>
                {`${t('new_lot.upload')} ${items.length > 1 ? t(ui.uploadMany) : t(ui.uploadOne)}`}
                <Upload className='ml-2 h-4 w-4' />
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
