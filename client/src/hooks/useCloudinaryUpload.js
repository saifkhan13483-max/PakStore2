import { useState, useCallback } from "react";
import { uploadFile } from "../services/cloudinaryService";

export const useCloudinaryUpload = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setUploadedData(null);
    setError(null);
  }, []);

  const upload = useCallback(async (file, options = {}) => {
    const { folder = "uploads" } = options;
    
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const data = await uploadFile(file, folder, (percent) => {
        setProgress(percent);
      });
      
      setUploadedData(data);
      setIsUploading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      setIsUploading(false);
      throw err;
    }
  }, []);

  return {
    upload,
    progress,
    isUploading,
    uploadedData,
    error,
    reset,
  };
};
