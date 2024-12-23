'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { X, VideoIcon, Play, Pause, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from '@hello-pangea/dnd';
import { convertToBase64 } from '@/app/utils/convert-to-base64';
import { useCreateVideo, useDeleteVideo, useReorderVideo } from '@/app/queries/video';
import { generateUUID } from '@/app/utils/generate-uuid';
import getReorderedFiles from '@/app/utils/get-reordered-files';
import { Video } from '@prisma/client';
import Spinner from './spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export type UploadedVideo = {
  id: string;
  file: File;
  position: number;
  previewUrl: string;
  isVideoUploaded: boolean;
  isLoading: boolean;
};

type VideoUploaderParams = {
  auctionId: string;
  lotId: string;
  videos: Video[];
  dropzoneOptions?: Omit<DropzoneOptions, 'onDrop'>;
};

const VideoUploader = ({ auctionId, lotId, videos: existingVideos = [], dropzoneOptions }: VideoUploaderParams) => {
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const isAllVideosUploaded = videos.every((video) => video.isVideoUploaded);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: createVideo } = useCreateVideo(auctionId, lotId);
  const { mutateAsync: deleteVideo } = useDeleteVideo(auctionId, lotId);
  const { mutateAsync: reorderVideo } = useReorderVideo(auctionId, lotId);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    setVideos(
      existingVideos.map((video) => ({
        id: video.id,
        file: new File([], video.name),
        previewUrl: video.url,
        position: video.position,
        isVideoUploaded: true,
        isLoading: false,
      }))
    );
  }, [existingVideos]);

  useEffect(() => {
    return () => videos.forEach((video) => URL.revokeObjectURL(video.previewUrl));
  }, [videos]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newVideos = acceptedFiles
        .filter((file) => !videos.some((video) => video.file.name === file.name))
        .map((file, index) => ({
          id: generateUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          position: videos.length + index + 1,
          isVideoUploaded: false,
          isLoading: false,
        }));

      setVideos((prev) => [...prev, ...newVideos]);
    },
    [videos]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    ...dropzoneOptions,
  });

  const removeVideo = async (identifier: string) => {
    let videoToDelete: UploadedVideo | undefined;

    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === identifier) {
          videoToDelete = { ...video, isLoading: true };
          return videoToDelete;
        }
        return video;
      })
    );

    const needRequestToDelete = !!videoToDelete?.isVideoUploaded;

    if (videoToDelete && needRequestToDelete) {
      try {
        await deleteVideo({
          id: identifier,
        });

        toast.success(`The video ${videoToDelete.file.name} has been successfully deleted`, {
          style: {
            textAlign: 'center',
          },
        });
      } catch {
        toast.error('Something went wrong');
      }
    }

    setVideos((prev) => {
      const newVideos = prev.filter(({ id }) => id !== identifier);

      if (videoToDelete?.previewUrl) {
        URL.revokeObjectURL(videoToDelete.previewUrl);
      }

      return newVideos;
    });
  };

  const uploadVideos = async () => {
    try {
      setIsUploading(true);

      const data = await Promise.all(
        videos.map(async ({ id, file, position, isVideoUploaded }) => ({
          file: await convertToBase64(file),
          position,
          name: file.name,
          isVideoUploaded,
          id,
        }))
      );

      await createVideo(data);

      const newVideosLength = data.filter(({ isVideoUploaded }) => !isVideoUploaded).length;
      toast.success(`Successfully uploaded ${newVideosLength} video${newVideosLength > 1 ? 's' : ''}.`, {
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

    const reorderedFiles = getReorderedFiles({ id: draggableId, files: videos, newPosition: destination.index });
    setVideos(reorderedFiles);

    const hasNewVideos = reorderedFiles.some(({ isVideoUploaded }) => !isVideoUploaded);

    if (hasNewVideos) return;

    setVideos((prevVideos) =>
      prevVideos.map((video) => (video.id === draggableId ? { ...video, isLoading: true } : video))
    );

    try {
      await reorderVideo({ id: draggableId, position: destination.index });

      toast.success('The video position has been successfully updated', {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      toast.error('Something went wrong');
    } finally {
      setVideos((prevVideos) =>
        prevVideos.map((video) => ({
          ...video,
          isLoading: false,
        }))
      );
    }
  };

  const onPlay = (index: string) => {
    if (currentlyPlaying === index) {
      videoRefs.current[index]?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying !== null) {
        videoRefs.current[currentlyPlaying]?.pause();
      }
      console.log('REFS', videoRefs.current);
      videoRefs.current[index]?.play();
      setCurrentlyPlaying(index);
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
        <VideoIcon className='mx-auto h-12 w-12 text-gray-400' />
        <p className='mt-2 text-sm text-gray-600'>Drag and drop some videos here, or click to select videos</p>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='videos' direction='horizontal'>
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
              {videos.map(({ id, file, previewUrl, position, isLoading }) => (
                <Draggable key={id} draggableId={id} index={position}>
                  {(provided: DraggableProvided) => (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className='relative w-16 h-16'
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <video
                              className='w-full h-full object-cover rounded-lg duration-300 hover:scale-[1.06]'
                              ref={(el) => {
                                videoRefs.current[id] = el;
                              }}
                              src={previewUrl}
                              controls={false}
                              draggable={true}
                            />

                            {/* <div className='absolute w-full h-full z-50 cursor-grabbing' /> */}
                            {isLoading ? (
                              <>
                                <div className='absolute inset-0 bg-slate-500 opacity-50 rounded-lg'></div>
                                <div className='absolute inset-0 flex items-center justify-center'>
                                  <Spinner className='text-rose-500' />
                                </div>
                              </>
                            ) : (
                              <Button
                                variant='secondary'
                                size='icon'
                                className='absolute inset-0 m-auto h-6 w-6 opacity-80 z-30'
                                onClick={() => onPlay(id)}
                                draggable={true}
                              >
                                {currentlyPlaying === id ? <Pause className='h-3 w-3' /> : <Play className='h-3 w-3' />}
                              </Button>
                            )}

                            <Button
                              variant='destructive'
                              size='icon'
                              className='absolute -top-1 -right-1 h-5 w-5'
                              onClick={() => removeVideo(id)}
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

      {videos.length > 0 && (
        <div className='space-y-4'>
          <Button onClick={uploadVideos} disabled={isUploading || isAllVideosUploaded} className='w-full'>
            {isUploading ? (
              <div className='flex items-center justify-center'>
                <Spinner />
              </div>
            ) : (
              <div className='flex items-center'>
                {`Upload Video${videos.length > 1 ? 's' : ''}`}
                <Upload className='ml-2 h-4 w-4' />
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
