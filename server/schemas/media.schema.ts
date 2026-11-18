import { z } from 'zod';
import { objectId } from './common';

export const uploadMediaSchema = z
  .array(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(255),
      position: z.number().int().min(1),
      /** Base64 data URL of the file for new uploads. */
      file: z.string(),
      isFileUploaded: z.boolean(),
    })
  )
  .max(100);

export const deleteMediaSchema = z.object({
  id: objectId,
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
