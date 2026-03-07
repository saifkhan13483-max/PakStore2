/**
 * Cloudinary Upload Utility with Fallback Logic
 * 
 * Strategy:
 * 1. Try uploading to Account A (primary)
 * 2. If quota/rate limit error, fallback to Account B (secondary)
 * 3. Return full metadata (url, publicId, cloudName) for Firestore storage
 */

import { CLOUDINARY_A, CLOUDINARY_B, getUploadUrl } from "@/config/cloudinary";

export interface UploadedImage {
  url: string;
  publicId: string;
  cloudName: string;
}

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  error?: {
    message: string;
    http_code?: number;
  };
}

interface CloudinaryErrorResponse {
  error: {
    message: string;
    http_code?: number;
    code?: string;
  };
}

/**
 * Detects if a Cloudinary error indicates quota/storage/rate limit issues
 */
function isCloudinaryQuotaError(err: unknown): boolean {
  // Handle Cloudinary API error response
  if (typeof err === 'object' && err !== null) {
    const error = err as any;
    
    // Check error message patterns
    const message = error.message || error.error?.message || '';
    const messageStr = message.toString().toLowerCase();
    
    const quotaPatterns = [
      'quota',
      'limit',
      'rate',
      'bandwidth',
      'storage',
      'exceeded',
      'plan',
      'upgrade',
      'too many',
    ];
    
    if (quotaPatterns.some(pattern => messageStr.includes(pattern))) {
      return true;
    }
    
    // Check HTTP status codes that indicate quota/limit issues
    const statusCode = error.http_code || error.status;
    if (statusCode === 429 || statusCode === 402 || statusCode === 403) {
      return true;
    }
    
    // Check Cloudinary-specific error codes
    const errorCode = error.code || error.error?.code || '';
    if (
      errorCode === 'QUOTA_EXCEEDED' ||
      errorCode === 'PLAN_LIMIT_EXCEEDED' ||
      errorCode === 'RATE_LIMIT_EXCEEDED'
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Attempts to upload to a specific Cloudinary account
 */
async function uploadToAccount(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  const response = await fetch(getUploadUrl(cloudName), {
    method: 'POST',
    body: formData,
  });
  
  const data = (await response.json()) as CloudinaryResponse | CloudinaryErrorResponse;
  
  if (!response.ok || 'error' in data) {
    const error = 'error' in data ? data.error : (data as any).error;
    const err = new Error(error?.message || 'Upload failed');
    (err as any).http_code = error?.http_code;
    (err as any).code = error?.code;
    throw err;
  }
  
  return {
    url: (data as CloudinaryResponse).secure_url,
    publicId: (data as CloudinaryResponse).public_id,
    cloudName,
  };
}

/**
 * Main upload function with fallback logic
 * 
 * Try Account A first → if quota error, fallback to Account B
 * For other errors, throw immediately (don't retry)
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Try primary account (Account A)
  try {
    console.log('[Cloudinary] Attempting upload to Account A...');
    const result = await uploadToAccount(
      file,
      CLOUDINARY_A.cloudName,
      CLOUDINARY_A.uploadPreset
    );
    console.log('[Cloudinary] Upload successful to Account A', {
      publicId: result.publicId,
      cloudName: result.cloudName,
    });
    return result;
  } catch (err) {
    // Check if this is a quota/rate limit error
    if (isCloudinaryQuotaError(err)) {
      console.warn('[Cloudinary] Account A quota exceeded, attempting fallback to Account B...', err);
      
      // Try fallback account (Account B)
      try {
        const result = await uploadToAccount(
          file,
          CLOUDINARY_B.cloudName,
          CLOUDINARY_B.uploadPreset
        );
        console.log('[Cloudinary] Upload successful to Account B (fallback)', {
          publicId: result.publicId,
          cloudName: result.cloudName,
        });
        return result;
      } catch (fallbackErr) {
        console.error('[Cloudinary] Fallback to Account B failed', fallbackErr);
        throw new Error(
          `Upload failed: Account A quota exceeded, fallback Account B also failed: ${
            fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'
          }`
        );
      }
    }
    
    // For non-quota errors, throw immediately (don't fallback)
    console.error('[Cloudinary] Upload failed with non-recoverable error', err);
    throw err;
  }
}

/**
 * Constructs a Cloudinary URL from cloud name and public ID
 * Useful if you only store cloud name and public ID
 */
export function getCloudinaryImageUrl(
  cloudName: string,
  publicId: string,
  options?: { width?: number; height?: number; crop?: string; quality?: string }
): string {
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Add transformations if provided
  if (options) {
    const transforms: string[] = [];
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    
    if (transforms.length > 0) {
      url += `/${transforms.join(',')}`;
    }
  }
  
  url += `/${publicId}`;
  
  return url;
}
