import { Photo, Video } from '@prisma/client';

/** Kinds of media attached to a lot. Photos and videos share one record shape. */
export type MediaKind = 'photo' | 'video';

export type MediaRecord = Photo | Video;
