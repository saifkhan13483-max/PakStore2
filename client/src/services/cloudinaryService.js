import { cloudinaryConfig } from "../config/cloudinary";

export const validateFile = (file) => {
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? 100 * 1024 * 1024 : 2 * 1024 * 1024; // 100MB for video, 2MB for images
  const allowedTypes = [
    "image/jpeg", 
    "image/png", 
    "image/webp",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm"
  ];

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: isVideo 
        ? "Unsupported video format. Please use MP4, MOV, or AVI." 
        : "Only JPG, PNG, and WebP formats are accepted" 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size exceeds ${isVideo ? '100MB' : '2MB'} limit` 
    };
  }

  return { valid: true };
};

// Check if error indicates quota/rate limit
const isQuotaError = (responseText) => {
  try {
    const data = JSON.parse(responseText);
    const message = (data.error?.message || data.message || "").toLowerCase();
    return (
      message.includes("quota") ||
      message.includes("limit") ||
      message.includes("rate") ||
      message.includes("bandwidth") ||
      message.includes("storage") ||
      message.includes("exceeded") ||
      message.includes("plan")
    );
  } catch {
    return false;
  }
};

// Upload to a specific account
const uploadToAccount = (file, folder, uploadEndpoint, uploadPreset, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    xhr.open("POST", uploadEndpoint);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            format: response.format,
            width: response.width,
            height: response.height,
          });
        } catch (e) {
          reject(new Error("Invalid response from upload server"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject({ 
            error: new Error(error.message || "Upload failed"),
            responseText: xhr.responseText 
          });
        } catch {
          reject({ 
            error: new Error("Upload failed"),
            responseText: xhr.responseText 
          });
        }
      }
    };

    xhr.onerror = () => reject({ error: new Error("Network error"), responseText: "" });
    xhr.send(formData);
  });
};

export const uploadFile = async (file, folder = "uploads", onProgress) => {
  const { valid, error } = validateFile(file);
  if (!valid) throw new Error(error);

  // Try primary account
  console.log("[cloudinaryService] Attempting upload to Account A...");
  try {
    const result = await uploadToAccount(
      file,
      folder,
      cloudinaryConfig.uploadEndpoint,
      cloudinaryConfig.uploadPreset,
      onProgress
    );
    console.log("[cloudinaryService] Upload successful to Account A");
    return result;
  } catch (err) {
    // Check if fallback is available and error is quota-related
    if (
      cloudinaryConfig.hasFallback &&
      err.responseText &&
      isQuotaError(err.responseText)
    ) {
      console.warn("[cloudinaryService] Account A quota exceeded, attempting Account B fallback...");
      try {
        const result = await uploadToAccount(
          file,
          folder,
          cloudinaryConfig.fallback.uploadEndpoint,
          cloudinaryConfig.fallback.uploadPreset,
          onProgress
        );
        console.log("[cloudinaryService] Upload successful to Account B (fallback)");
        return result;
      } catch (fallbackErr) {
        throw fallbackErr.error || new Error("Fallback upload also failed");
      }
    }
    throw err.error || err;
  }
};

export const uploadMultipleFiles = async (files, folder = "uploads", onProgress) => {
  const uploadPromises = Array.from(files).map((file, index) => {
    return uploadFile(file, folder, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  return Promise.all(uploadPromises);
};

export const generateOptimizedUrl = (publicId, transformations = {}) => {
  const { width, height, crop = "fill", quality = "auto", fetch_format = "auto" } = transformations;
  
  let transformationStr = `q_${quality},f_${fetch_format}`;
  if (width) transformationStr += `,w_${width}`;
  if (height) transformationStr += `,h_${height}`;
  if (crop) transformationStr += `,c_${crop}`;

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformationStr}/${publicId}`;
};
