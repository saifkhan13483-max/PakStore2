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
  dpr?: string | number;
}

/**
 * Transforms a Cloudinary URL to include optimization parameters.
 * Defaults to:
 * - f_auto: Automatic format (WebP/AVIF depending on browser support)
 * - q_auto: Automatic quality (optimizes for visual quality vs file size)
 * - c_fill: Crop and fill to specified dimensions
 */
export function getOptimizedImageUrl(url: string, options: CloudinaryOptions = {}) {
  if (!url) return url;
  
  // Normalization logic for different URL types
  let normalizedUrl = url;

  // Handle Cloudinary short IDs or incomplete paths if they were stored that way
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('attached_assets') && cloudName) {
    // If it's just an ID, construct a full Cloudinary URL
    normalizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${url}`;
  }

  if (!normalizedUrl.includes('cloudinary.com')) {
    // Handle attached assets
    if (normalizedUrl.startsWith('attached_assets/') || normalizedUrl.startsWith('/attached_assets/')) {
      return normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    }

    // Handle local public assets
    if (normalizedUrl.startsWith('/images/') || normalizedUrl.startsWith('images/')) {
      return normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    }

    // If it's a relative path from old Express (e.g. /uploads/...), we can't resolve it easily 
    // without a base URL, so we return as is and let the fallback handle it
    return normalizedUrl;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    dpr = 'auto'
  } = options;

  const parts = normalizedUrl.split('/upload/');
  if (parts.length !== 2) return normalizedUrl;

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    `dpr_${dpr}`
  ];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
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
    console.error("Cloudinary config missing:", { cloudName, uploadPreset });
    throw new Error("Cloudinary configuration missing. Please check environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  // Ensure the folder exists or remove if it causes issues with unsigned uploads
  formData.append("folder", "pakcart/products");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Cloudinary upload error response:", errorData);
      throw new Error(errorData.error?.message || errorData.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (err: any) {
    console.error("Cloudinary upload exception:", err);
    throw err;
  }
}
