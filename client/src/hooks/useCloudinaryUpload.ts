import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  folder?: string;
}

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const upload = async (file: File, options: UploadOptions = {}) => {
    if (!cloudName || !uploadPreset) {
      const err = new Error("Cloudinary configuration missing");
      setError(err);
      options.onError?.(err);
      return;
    }

    // Validation
    if (!file.type.startsWith("image/")) {
      const err = new Error("File must be an image");
      toast({ variant: "destructive", title: "Invalid file type", description: "Please upload an image." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      const err = new Error("File size too large");
      toast({ variant: "destructive", title: "File too large", description: "Image must be less than 5MB." });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    if (options.folder) {
      formData.append("folder", options.folder);
    }

    try {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const promise = new Promise<string>((resolve, reject) => {
        xhr.open("POST", url);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
            options.onProgress?.(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      const secureUrl = await promise;
      setIsUploading(false);
      setProgress(100);
      options.onSuccess?.(secureUrl);
      return secureUrl;
    } catch (err: any) {
      setIsUploading(false);
      const error = err instanceof Error ? err : new Error(err.message || "Upload failed");
      setError(error);
      options.onError?.(error);
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
      throw error;
    }
  };

  return { upload, isUploading, progress, error };
}
