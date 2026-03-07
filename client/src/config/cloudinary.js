/**
 * Cloudinary configuration for client-side uploads with dual-account fallback.
 * This file contains public configuration only.
 * No secret keys or API secrets should be included here.
 */

const cloudNameA = import.meta.env.VITE_CLOUDINARY_A_CLOUD_NAME;
const uploadPresetA = import.meta.env.VITE_CLOUDINARY_A_UPLOAD_PRESET;

const cloudNameB = import.meta.env.VITE_CLOUDINARY_B_CLOUD_NAME;
const uploadPresetB = import.meta.env.VITE_CLOUDINARY_B_UPLOAD_PRESET;

// Legacy single-account support
const legacyCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const legacyUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Determine which config to use
const hasAccountA = cloudNameA && uploadPresetA;
const hasAccountB = cloudNameB && uploadPresetB;
const hasLegacy = legacyCloudName && legacyUploadPreset;

if (!hasAccountA && !hasLegacy) {
  console.warn('Cloudinary Cloud Name (Account A or legacy) is not configured. Media uploads will fail.');
}

if (!uploadPresetA && !legacyUploadPreset) {
  console.warn('Cloudinary Upload Preset (Account A or legacy) is not configured. Media uploads will fail.');
}

// Export primary and fallback accounts
export const cloudinaryConfig = {
  // Primary account (A) or fallback to legacy
  cloudName: cloudNameA || legacyCloudName,
  uploadPreset: uploadPresetA || legacyUploadPreset,
  uploadEndpoint: `https://api.cloudinary.com/v1_1/${cloudNameA || legacyCloudName}/upload`,
  
  // Fallback account (B) for quota exceeded scenarios
  fallback: {
    cloudName: cloudNameB,
    uploadPreset: uploadPresetB,
    uploadEndpoint: cloudNameB ? `https://api.cloudinary.com/v1_1/${cloudNameB}/upload` : null,
  },
  
  // Feature flags
  hasFallback: hasAccountB && hasAccountA,
  isDualAccount: hasAccountA && hasAccountB,
  isLegacyMode: hasLegacy && !hasAccountA,
};

export default cloudinaryConfig;
