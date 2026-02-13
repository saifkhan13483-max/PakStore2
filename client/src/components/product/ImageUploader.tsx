import { useState, useCallback } from "react";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  compact?: boolean;
}

export function ImageUploader({ 
  value = [], 
  onChange, 
  maxImages = 5,
  disabled = false,
  compact = false
}: ImageUploaderProps) {
  const { upload, isUploading, progress } = useCloudinary();
  const [dragActive, setDragActive] = useState(false);

  const onUpload = useCallback(async (file: File) => {
    const result = await upload(file);
    if (result) {
      if (maxImages === 1) {
        onChange([result.secure_url]);
      } else {
        onChange([...value, result.secure_url]);
      }
    }
  }, [upload, value, onChange, maxImages]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isUploading || value.length >= maxImages) return;

    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  }, [disabled, isUploading, value.length, maxImages, onUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }, [onUpload]);

  const removeImage = (url: string) => {
    onChange(value.filter((item) => item !== url));
  };

  if (compact && maxImages === 1) {
    return (
      <div className="flex items-center gap-3">
        {value[0] ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border">
            <img src={value[0]} alt="Variant preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(value[0])}
              disabled={disabled || isUploading}
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className={cn(
            "w-12 h-12 flex items-center justify-center rounded-lg border-2 border-dashed transition-all cursor-pointer",
            isUploading ? "opacity-50 cursor-not-allowed" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted"
          )}>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={disabled || isUploading} />
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
        {value.map((url, index) => (
          <Card key={url} className="relative aspect-square group overflow-hidden border-2 border-muted hover:border-primary/50 transition-all rounded-xl shadow-none hover:shadow-md">
            <img 
              src={url} 
              alt={`Product preview ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              disabled={disabled || isUploading}
              className="absolute top-1.5 right-1.5 p-1.5 bg-background/90 hover:bg-destructive hover:text-destructive-foreground rounded-full shadow-sm sm:opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm py-1 px-2 text-[9px] sm:text-[10px] font-bold text-center sm:opacity-0 group-hover:opacity-100 transition-opacity">
              IMAGE {index + 1}
            </div>
          </Card>
        ))}

        {value.length < maxImages && (
          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative aspect-square flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
              (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3 w-full px-2 sm:px-4 text-center">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
                <div className="w-full space-y-1 sm:space-y-1.5">
                  <Progress value={progress?.percentage || 0} className="h-1 sm:h-1.5" />
                  <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {progress?.percentage || 0}%
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-2 sm:p-3 rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-center px-1">
                  <p className="text-[11px] sm:text-xs font-bold text-foreground">Add Photo</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{value.length} / {maxImages}</p>
                </div>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
}
