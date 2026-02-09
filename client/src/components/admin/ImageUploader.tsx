import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
}

export function ImageUploader({ value, onChange, maxFiles = 8, folder = "pakcart/products" }: ImageUploaderProps) {
  const { upload, isUploading, progress } = useCloudinaryUpload();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - value.length;
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > remainingSlots) {
      toast({
        title: "Max files reached",
        description: `Only ${remainingSlots} more images can be uploaded.`,
        variant: "destructive",
      });
    }

    let successCount = 0;
    for (const file of filesToUpload) {
      try {
        const url = await upload(file, { folder });
        if (url) {
          onChange([...value, url]);
          successCount++;
        }
      } catch (error) {
        // useCloudinaryUpload hook already shows a toast for the error
        console.error("Upload error:", error);
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${successCount} image${successCount > 1 ? "s" : ""}.`,
      });
    }
  }, [value, onChange, maxFiles, upload, folder, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: isUploading || value.length >= maxFiles,
  });

  const removeImage = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}
          ${(isUploading || value.length >= maxFiles) ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground">
            Up to {maxFiles} images (max 5MB each)
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {value.map((url, index) => (
            <Card key={url} className="relative group aspect-square overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <img
                src={url.replace("/upload/", "/upload/c_fill,g_auto,w_300,h_300,q_auto,f_auto/")}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
