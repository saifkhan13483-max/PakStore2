import { auth } from "../config/firebase";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Service for comprehensive file validation before uploading to Cloudinary.
 */

const LIMITS = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    minDimensions: { width: 100, height: 100 },
    maxDimensions: { width: 5000, height: 5000 }
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/mpeg"],
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
  }
};

/**
 * Validates file type and size.
 * @param {File} file 
 * @param {string} category - 'image', 'video', or 'document'
 */
export const validateFileBasics = (file, category = "image") => {
  const config = LIMITS[category] || LIMITS.image;

  if (!config.allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Supported types for ${category} are: ${config.allowedTypes.join(", ")}` 
    };
  }

  if (file.size > config.maxSize) {
    const sizeInMB = (config.maxSize / (1024 * 1024)).toFixed(0);
    return { 
      isValid: false, 
      error: `File is too large. Maximum size for ${category} is ${sizeInMB}MB.` 
    };
  }

  return { isValid: true };
};

/**
 * Validates image dimensions.
 * @param {File} file 
 */
export const validateImageDimensions = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      return resolve({ isValid: true });
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const { width, height } = img;
      const { minDimensions, maxDimensions } = LIMITS.image;

      if (width < minDimensions.width || height < minDimensions.height) {
        resolve({ 
          isValid: false, 
          error: `Image dimensions too small. Minimum is ${minDimensions.width}x${minDimensions.height}px.` 
        });
      } else if (width > maxDimensions.width || height > maxDimensions.height) {
        resolve({ 
          isValid: false, 
          error: `Image dimensions too large. Maximum is ${maxDimensions.width}x${maxDimensions.height}px.` 
        });
      } else {
        resolve({ isValid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({ isValid: false, error: "Failed to load image for dimension validation." });
    };
  });
};

/**
 * Checks if user has exceeded their upload quota.
 * This is a client-side check. Server-side rules should also exist.
 * @param {string} userId 
 */
export const checkUploadQuota = async (userId) => {
  try {
    if (!userId) return { isValid: false, error: "User authentication required." };

    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return { isValid: true }; // New user

    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    
    // Example quota structure: { lastUploadDate: '2023-10-27', dailyUploadCount: 5 }
    if (userData.lastUploadDate === today && userData.dailyUploadCount >= 50) {
      return { 
        isValid: false, 
        error: "Daily upload quota reached. Please try again tomorrow." 
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error checking quota:", error);
    return { isValid: true }; // Fallback to allow upload if check fails
  }
};

/**
 * Performs comprehensive validation.
 * @param {File} file 
 * @param {string} userId 
 */
export const validateUpload = async (file, userId) => {
  let category = "image";
  if (file.type.startsWith("video/")) category = "video";
  else if (!file.type.startsWith("image/")) category = "document";

  // 1. Basic type and size check
  const basicCheck = validateFileBasics(file, category);
  if (!basicCheck.isValid) return basicCheck;

  // 2. Image dimension check
  if (category === "image") {
    const dimCheck = await validateImageDimensions(file);
    if (!dimCheck.isValid) return dimCheck;
  }

  // 3. Quota check
  const quotaCheck = await checkUploadQuota(userId);
  if (!quotaCheck.isValid) return quotaCheck;

  return { isValid: true };
};
