import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UploadOptions {
  folder?: string;
  tags?: string[];
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const upload = useCallback(
    async (file: File, options: UploadOptions = {}): Promise<string | null> => {
      // 1. Validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        const errorMsg = "Only JPEG, PNG, and WebP images are allowed.";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: errorMsg,
        });
        return null;
      }

      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = "Image size must be less than 5MB.";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "File too large",
          description: errorMsg,
        });
        return null;
      }

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        const errorMsg = "Cloudinary environment variables are missing.";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "Configuration error",
          description: "Cloudinary is not properly configured.",
        });
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      if (options.folder) formData.append("folder", options.folder);
      if (options.tags) formData.append("tags", options.tags.join(","));

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            const response: CloudinaryUploadResult = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            const errorMsg = "Failed to upload image to Cloudinary.";
            setError(errorMsg);
            toast({
              variant: "destructive",
              title: "Upload failed",
              description: errorMsg,
            });
            resolve(null);
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          const errorMsg = "Network error occurred during upload. Please check your internet connection.";
          setError(errorMsg);
          toast({
            variant: "destructive",
            title: "Network error",
            description: errorMsg,
          });
          resolve(null);
        };

        xhr.send(formData);
      });
    },
    [toast]
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    reset: () => {
      setIsUploading(false);
      setProgress(0);
      setError(null);
    },
  };
}
