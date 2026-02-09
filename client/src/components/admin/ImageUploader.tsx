import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableImageProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}

function SortableImage({ url, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="relative group aspect-square overflow-hidden border-2 hover:border-primary/50 transition-colors">
        <img
          src={url.replace("/upload/", "/upload/c_fill,g_auto,w_300,h_300,q_auto,f_auto/")}
          alt={`Product ${index + 1}`}
          className="w-full h-full object-cover"
        />
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-1 left-1 h-6 w-6 bg-black/50 text-white rounded flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-3 w-3" />
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(index)}
        >
          <X className="h-3 w-3" />
        </Button>
      </Card>
    </div>
  );
}

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
}

export function ImageUploader({ value, onChange, maxFiles = 8, folder = "pakcart/products" }: ImageUploaderProps) {
  const { upload, isUploading, progress } = useCloudinaryUpload();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    let newUrls = [...value];

    for (const file of filesToUpload) {
      try {
        const url = await upload(file, { folder });
        if (url) {
          newUrls = [...newUrls, url];
          onChange(newUrls);
          successCount++;
        }
      } catch (error) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={value} 
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {value.map((url, index) => (
                <SortableImage 
                  key={url} 
                  url={url} 
                  index={index} 
                  onRemove={removeImage} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
