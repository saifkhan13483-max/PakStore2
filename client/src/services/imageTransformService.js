/**
 * client/src/services/imageTransformService.js
 * Service for generating optimized Cloudinary image URLs with transformations.
 */
import { cloudinaryConfig } from '../config/cloudinary';

/**
 * Generates a Cloudinary URL with the specified transformations.
 * @param {string} publicId - The Cloudinary public ID.
 * @param {string} transformationStr - The transformation string.
 * @returns {string} The formatted Cloudinary URL.
 */
const getUrl = (publicId, transformationStr) => {
  if (!publicId) return '';
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformationStr}/${publicId}`;
};

/**
 * Generates a srcset string for responsive images.
 * @param {string} publicId - The Cloudinary public ID.
 * @returns {string} The srcset string.
 */
export const getResponsiveImageSet = (publicId) => {
  const sizes = [320, 640, 768, 1024, 1280];
  return sizes
    .map((size) => `${getUrl(publicId, `c_fill,w_${size},q_auto,f_auto`)} ${size}w`)
    .join(', ');
};

/**
 * Generates a square thumbnail URL.
 * @param {string} publicId - The Cloudinary public ID.
 * @param {number} size - The size of the thumbnail (default 200).
 * @returns {string} The thumbnail URL.
 */
export const getThumbnail = (publicId, size = 200) => {
  return getUrl(publicId, `c_fill,w_${size},h_${size},g_auto,q_auto,f_auto`);
};

/**
 * Generates a circular crop URL for user avatars.
 * @param {string} publicId - The Cloudinary public ID.
 * @param {number} size - The size of the avatar (default 150).
 * @returns {string} The avatar URL.
 */
export const getProfileAvatar = (publicId, size = 150) => {
  return getUrl(publicId, `c_fill,w_${size},h_${size},g_face,r_max,q_auto,f_auto`);
};

/**
 * Generates an optimized image URL.
 * @param {string} publicId - The Cloudinary public ID.
 * @param {number} maxWidth - The maximum width of the image.
 * @param {string} quality - The quality setting (default 'auto').
 * @returns {string} The optimized image URL.
 */
export const getOptimizedImage = (publicId, maxWidth = 1200, quality = 'auto') => {
  return getUrl(publicId, `c_limit,w_${maxWidth},q_${quality},f_auto`);
};

/**
 * Applies an artistic filter to the image.
 * @param {string} publicId - The Cloudinary public ID.
 * @param {string} filterName - The name of the Cloudinary filter (e.g., 'sepia', 'grayscale').
 * @returns {string} The filtered image URL.
 */
export const applyFilter = (publicId, filterName) => {
  return getUrl(publicId, `e_${filterName},q_auto,f_auto`);
};

/**
 * Generates a low-quality blur placeholder URL.
 * @param {string} publicId - The Cloudinary public ID.
 * @returns {string} The placeholder URL.
 */
export const generateBlurPlaceholder = (publicId) => {
  return getUrl(publicId, 'c_fill,w_50,q_1,f_auto,e_blur:1000');
};

const imageTransformService = {
  getResponsiveImageSet,
  getThumbnail,
  getProfileAvatar,
  getOptimizedImage,
  applyFilter,
  generateBlurPlaceholder,
};

export default imageTransformService;
