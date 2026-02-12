/**
 * Cloudinary image optimization utility for PakCart.
 * Provides automatic format conversion, responsive sizing, and quality optimization.
 */

interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
}

/**
 * Transforms a Cloudinary URL to include optimization parameters.
 * Defaults to:
 * - f_auto: Automatic format (WebP/AVIF depending on browser support)
 * - q_auto: Automatic quality (optimizes for visual quality vs file size)
 * - c_fill: Crop and fill to specified dimensions
 */
export function getOptimizedImageUrl(url: string, options: CloudinaryOptions = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good', // Optimized for Pakistani networks (slightly more compressed but fast)
    format = 'auto'
  } = options;

  // Split URL into parts: base, upload, and path
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
  ];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`height_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
}

/**
 * Generates a responsive srcSet for an image.
 */
export function getResponsiveSrcSet(url: string, widths: number[] = [320, 640, 768, 1024, 1280]) {
  if (!url || !url.includes('cloudinary.com')) return undefined;

  return widths
    .map(w => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Performs a direct unsigned upload to Cloudinary.
 * Used for client-side uploads without a backend.
 */
export async function uploadImage(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "pakcart/products");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload image");
  }

  const data = await response.json();
  return data.secure_url;
}
