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

  // Check if error indicates quota/rate limit
  const isQuotaError = (responseText: string): boolean => {
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

  // Try uploading to a specific account
  const uploadToAccount = (
    file: File,
    cloudName: string,
    uploadPreset: string
  ): Promise<{ success: boolean; response?: any; error?: string }> => {
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

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ success: true, response });
          } catch (e) {
            resolve({ success: false, error: "Invalid response from upload server." });
          }
        } else {
          let errMsg = "Upload failed";
          try {
            const errorData = JSON.parse(xhr.responseText);
            errMsg = errorData.error?.message || errorData.message || errMsg;
          } catch (e) {}
          resolve({ success: false, error: errMsg });
        }
      });

      xhr.addEventListener("error", () => {
        resolve({ success: false, error: "Network error" });
      });

      xhr.timeout = 120000;
      xhr.addEventListener("timeout", () => {
        resolve({ success: false, error: "Upload timed out. Your connection might be too slow." });
      });

      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  };

  const upload = useCallback(
    async (file: File): Promise<CloudinaryUploadResult | null> => {
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

      const cloudNameA = import.meta.env.VITE_CLOUDINARY_A_CLOUD_NAME;
      const uploadPresetA = import.meta.env.VITE_CLOUDINARY_A_UPLOAD_PRESET;
      const cloudNameB = import.meta.env.VITE_CLOUDINARY_B_CLOUD_NAME;
      const uploadPresetB = import.meta.env.VITE_CLOUDINARY_B_UPLOAD_PRESET;

      // Fallback to legacy env vars
      const legacyCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const legacyUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      const primaryCloudName = cloudNameA || legacyCloudName;
      const primaryUploadPreset = uploadPresetA || legacyUploadPreset;

      if (!primaryCloudName || !primaryUploadPreset) {
        const errMsg = "Cloudinary configuration is missing.";
        setError(errMsg);
        toast({ title: "Configuration Error", description: errMsg, variant: "destructive" });
        setIsUploading(false);
        return null;
      }

      // Try primary account (A)
      console.log("[useCloudinary] Attempting upload to Account A...");
      const result1 = await uploadToAccount(file, primaryCloudName, primaryUploadPreset);

      if (result1.success) {
        setIsUploading(false);
        setProgress(null);
        console.log("[useCloudinary] Upload successful to Account A");
        return result1.response;
      }

      // Check if quota error and fallback is available
      if (cloudNameB && uploadPresetB && isQuotaError(JSON.stringify({ error: { message: result1.error } }))) {
        console.warn("[useCloudinary] Account A quota exceeded, attempting Account B fallback...");
        const result2 = await uploadToAccount(file, cloudNameB, uploadPresetB);

        if (result2.success) {
          setIsUploading(false);
          setProgress(null);
          console.log("[useCloudinary] Upload successful to Account B (fallback)");
          return result2.response;
        } else {
          const errMsg = `Fallback upload also failed: ${result2.error}`;
          setError(errMsg);
          toast({ title: "Upload Failed", description: errMsg, variant: "destructive" });
          setIsUploading(false);
          return null;
        }
      }

      // Non-quota error or no fallback available
      const errMsg = result1.error || "Upload failed";
      setError(errMsg);
      toast({ title: "Upload Failed", description: errMsg, variant: "destructive" });
      setIsUploading(false);
      return null;
    },
    [toast]
  );

  return { upload, isUploading, progress, error, reset };
}
