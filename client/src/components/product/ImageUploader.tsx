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
}

export function ImageUploader({ 
  value = [], 
  onChange, 
  maxImages = 5,
  disabled = false 
}: ImageUploaderProps) {
  const { upload, isUploading, progress } = useCloudinary();
  const [dragActive, setDragActive] = useState(false);

  const onUpload = useCallback(async (file: File) => {
    const result = await upload(file);
    if (result) {
      onChange([...value, result.secure_url]);
    }
  }, [upload, value, onChange]);

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

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <Card key={url} className="relative aspect-square group overflow-hidden border-2 border-muted hover:border-primary/50 transition-all rounded-xl">
            <img 
              src={url} 
              alt={`Product preview ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              disabled={disabled || isUploading}
              className="absolute top-1.5 right-1.5 p-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-background/60 backdrop-blur-sm py-1 px-2 text-[10px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              "relative aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
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
              <div className="flex flex-col items-center gap-3 w-full px-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div className="w-full space-y-1.5">
                  <Progress value={progress?.percentage || 0} className="h-1.5" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Uploading {progress?.percentage || 0}%
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground">Add Photo</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{value.length} / {maxImages}</p>
                </div>
              </>
            )}
          </label>
        )}
      </div>

      {!isUploading && value.length === 0 && (
        <div 
          className={cn(
            "p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/10 bg-muted/30"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Upload Product Images</h3>
          <p className="text-sm text-muted-foreground max-w-[240px] mb-6">
            Drag and drop your images here or click the button below
          </p>
          <Button 
            type="button"
            variant="outline" 
            className="rounded-full px-8 border-primary/20 hover:border-primary/50"
            disabled={disabled}
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              input?.click();
            }}
          >
            Select Files
          </Button>
          <p className="mt-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            JPEG, PNG, WEBP (Max 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
