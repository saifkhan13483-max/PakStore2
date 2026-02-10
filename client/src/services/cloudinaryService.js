import { cloudinaryConfig } from "../config/cloudinary";

export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB default
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "application/pdf"];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type not supported" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB limit" };
  }

  return { valid: true };
};

export const uploadFile = async (file, folder = "uploads", onProgress) => {
  const { valid, error } = validateFile(file);
  if (!valid) throw new Error(error);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", cloudinaryConfig.uploadEndpoint);

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
        const response = JSON.parse(xhr.responseText);
        resolve({
          secure_url: response.secure_url,
          public_id: response.public_id,
          format: response.format,
          width: response.width,
          height: response.height,
        });
      } else {
        const error = JSON.parse(xhr.responseText);
        reject(new Error(error.message || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
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
