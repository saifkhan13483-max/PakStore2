import { uploadFile, validateFile } from "./cloudinaryService";
import { saveMediaMetadata } from "./mediaMetadataService";

/**
 * Combined service to handle file validation, Cloudinary upload, and Firestore metadata storage
 * 
 * @param {File} file - The file to upload
 * @param {string} userId - The ID of the user uploading the file
 * @param {object} options - Configuration and callbacks
 * @param {string} options.folder - Cloudinary folder path
 * @param {object} options.customMetadata - Additional metadata for Firestore
 * @param {function} options.onProgress - Callback for upload progress updates
 * 
 * @returns {Promise<object>} Combined result containing Cloudinary data and Firestore document ID
 */
export const uploadAndSave = async (file, userId, options = {}) => {
  const { 
    folder = `users/${userId}`, 
    customMetadata = {}, 
    onProgress = () => {} 
  } = options;

  try {
    // 1. Validate file before upload
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || "File validation failed");
    }

    // 2. Upload to Cloudinary
    // Progress is passed through to the cloudinaryService
    const cloudinaryData = await uploadFile(file, folder, onProgress);

    // 3. Save metadata to Firestore
    // We handle the potential partial failure here
    try {
      const firestoreData = await saveMediaMetadata(userId, cloudinaryData, customMetadata);
      
      // 4. Return combined result
      return {
        success: true,
        cloudinary: cloudinaryData,
        firestoreId: firestoreData.id,
        metadata: firestoreData
      };
    } catch (firestoreError) {
      console.error("Cloudinary upload succeeded, but Firestore metadata save failed:", firestoreError);
      
      // In case of Firestore failure, we still return the Cloudinary data 
      // but indicate the metadata save failed so the UI can handle it
      return {
        success: false,
        partialSuccess: true,
        error: "Media uploaded but failed to save metadata to database",
        cloudinary: cloudinaryData,
        firestoreError: firestoreError.message
      };
    }
  } catch (error) {
    console.error("Upload and save flow failed:", error);
    throw error;
  }
};

/**
 * Batch version of uploadAndSave for multiple files
 * 
 * @param {FileList|File[]} files - Files to upload
 * @param {string} userId - User ID
 * @param {object} options - Options for each upload
 */
export const uploadAndSaveMultiple = async (files, userId, options = {}) => {
  const fileArray = Array.from(files);
  const results = [];
  const errors = [];

  const uploadPromises = fileArray.map(async (file) => {
    try {
      const result = await uploadAndSave(file, userId, options);
      results.push(result);
    } catch (error) {
      errors.push({ file: file.name, error: error.message });
    }
  });

  await Promise.allSettled(uploadPromises);

  return {
    results,
    errors,
    totalProcessed: fileArray.length,
    successCount: results.length,
    failCount: errors.length
  };
};
