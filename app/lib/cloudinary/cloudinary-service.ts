import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: string, options?: UploadApiOptions) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      ...options,
    });
    return result;
  } catch (error) {
    throw new Error(`File upload failed: ${error}`);
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return { success: true, message: `File with public_id ${publicId} deleted successfully` };
    } else {
      throw new Error(result.result || 'Unknown error');
    }
  } catch (error) {
    throw new Error(`Failed to delete file with public_id ${publicId}: ${error}`);
  }
};
