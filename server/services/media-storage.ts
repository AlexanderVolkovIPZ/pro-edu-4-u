import { deleteFromCloudinary, uploadToCloudinary } from '@/app/lib/cloudinary/cloudinary-service';

export type MediaResourceType = 'image' | 'video';

export type StoredFile = { url: string; publicId: string };

/** Abstraction over the file storage so services do not depend on Cloudinary directly. */
export interface MediaStorage {
  upload(file: string, resourceType: MediaResourceType): Promise<StoredFile>;
  remove(publicId: string, resourceType: MediaResourceType): Promise<void>;
}

export class CloudinaryMediaStorage implements MediaStorage {
  async upload(file: string, resourceType: MediaResourceType): Promise<StoredFile> {
    const { url, public_id } = await uploadToCloudinary(file, {
      folder: process.env.CLOUDINARY_FOLDER_NAME,
      resource_type: resourceType,
    });

    return { url, publicId: public_id };
  }

  async remove(publicId: string, resourceType: MediaResourceType): Promise<void> {
    await deleteFromCloudinary(publicId, { resource_type: resourceType });
  }
}

export const cloudinaryMediaStorage = new CloudinaryMediaStorage();
