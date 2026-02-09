import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface CloudinaryUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

interface UseCloudinaryReturn {
  upload: (file: File) => Promise<CloudinaryUploadResult | null>;
  isUploading: boolean;
  progress: CloudinaryUploadProgress | null;
  error: string | null;
  reset: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function useCloudinary(): UseCloudinaryReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<CloudinaryUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File): Promise<CloudinaryUploadResult | null> => {
    // 1. Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errMsg = "Invalid file type. Please upload JPEG, PNG, WebP or AVIF.";
      setError(errMsg);
      toast({ title: "Upload Failed", description: errMsg, variant: "destructive" });
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      const errMsg = "File too large. Maximum size is 5MB.";
      setError(errMsg);
      toast({ title: "Upload Failed", description: errMsg, variant: "destructive" });
      return null;
    }

    setIsUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });
    setError(null);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const errMsg = "Cloudinary configuration is missing.";
      setError(errMsg);
      setIsUploading(false);
      return null;
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "pakcart/products");

      // Handle Progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });

      // Handle Success/Error
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setIsUploading(false);
          setProgress(null);
          resolve(response);
        } else {
          const errMsg = "Upload failed. Please check your connection.";
          setError(errMsg);
          setIsUploading(false);
          resolve(null);
        }
      });

      // Handle Network Errors (Common for slow connections)
      xhr.addEventListener("error", () => {
        const errMsg = "Network error. Please try again.";
        setError(errMsg);
        setIsUploading(false);
        resolve(null);
      });

      // Handle Timeout (Essential for slow Pakistani internet)
      xhr.timeout = 60000; // 60 seconds
      xhr.addEventListener("timeout", () => {
        const errMsg = "Upload timed out. Your connection might be too slow.";
        setError(errMsg);
        setIsUploading(false);
        resolve(null);
      });

      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  }, [toast]);

  return { upload, isUploading, progress, error, reset };
}
