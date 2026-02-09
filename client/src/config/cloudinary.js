/**
 * Cloudinary configuration for client-side uploads.
 * This file contains public configuration only.
 * No secret keys or API secrets should be included here.
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName) {
  console.warn('Cloudinary Cloud Name is not configured. Media uploads will fail.');
}

if (!uploadPreset) {
  console.warn('Cloudinary Upload Preset is not configured. Media uploads will fail.');
}

export const cloudinaryConfig = {
  cloudName,
  uploadPreset,
  uploadEndpoint: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
};

export default cloudinaryConfig;
