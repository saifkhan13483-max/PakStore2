/**
 * Cloudinary Configuration
 * Supports two accounts (Account A and Account B) with fallback logic
 */

export const CLOUDINARY_A = {
  cloudName: import.meta.env.VITE_CLOUDINARY_A_CLOUD_NAME!,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_A_UPLOAD_PRESET!,
};

export const CLOUDINARY_B = {
  cloudName: import.meta.env.VITE_CLOUDINARY_B_CLOUD_NAME!,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_B_UPLOAD_PRESET!,
};

/**
 * Upload endpoint for unsigned requests
 */
export const getUploadUrl = (cloudName: string) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
