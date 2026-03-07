/**
 * Image Upload Component with Cloudinary
 * Supports uploading with fallback to secondary account
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadImage, type UploadedImage } from '@/lib/uploadImage';

interface ImageUploaderProps {
  onUploadSuccess?: (image: UploadedImage) => void;
  onUploadError?: (error: Error) => void;
  maxFileSizeBytes?: number;
  acceptedFileTypes?: string[];
}

export function ImageUploader({
  onUploadSuccess,
  onUploadError,
  maxFileSizeBytes = 5 * 1024 * 1024, // 5MB default
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSelectedFile(file);

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      const errorMsg = `Invalid file type. Accepted: ${acceptedFileTypes.join(', ')}`;
      setError(errorMsg);
      onUploadError?.(new Error(errorMsg));
      return;
    }

    // Validate file size
    if (file.size > maxFileSizeBytes) {
      const maxSizeMB = (maxFileSizeBytes / 1024 / 1024).toFixed(1);
      const errorMsg = `File too large. Maximum size: ${maxSizeMB}MB`;
      setError(errorMsg);
      onUploadError?.(new Error(errorMsg));
      return;
    }

    // Upload
    setIsLoading(true);
    try {
      console.log('[ImageUploader] Starting upload for file:', file.name);
      const image = await uploadImage(file);
      
      setUploadedImage(image);
      setError(null);
      
      console.log('[ImageUploader] Upload successful', {
        fileName: file.name,
        cloudName: image.cloudName,
        publicId: image.publicId,
      });
      
      onUploadSuccess?.(image);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      setUploadedImage(null);
      
      console.error('[ImageUploader] Upload error:', err);
      onUploadError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full max-w-md">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-colors cursor-pointer
          ${
            isLoading
              ? 'border-gray-300 bg-gray-50 cursor-wait'
              : uploadedImage
                ? 'border-green-300 bg-green-50'
                : error
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
        data-testid="upload-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleInputChange}
          disabled={isLoading}
          className="hidden"
          data-testid="file-input"
        />

        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-gray-700">Uploading...</p>
          </div>
        )}

        {uploadedImage && !isLoading && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Upload successful</p>
              <p className="text-xs text-gray-600 mt-1">
                File: {selectedFile?.name}
              </p>
              <p className="text-xs text-gray-600">
                Account: {uploadedImage.cloudName}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-2 break-all">
                {uploadedImage.publicId}
              </p>
            </div>
            <img
              src={uploadedImage.url}
              alt="Uploaded preview"
              className="w-24 h-24 object-cover rounded-md mt-2"
              data-testid="preview-image"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedImage(null);
                setSelectedFile(null);
              }}
              data-testid="button-reset"
            >
              Upload Another
            </Button>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-900">Upload failed</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                setSelectedFile(null);
              }}
              data-testid="button-retry"
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !uploadedImage && !error && (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop image here or click to select
              </p>
              <p className="text-xs text-gray-600 mt-1">
                PNG, JPEG, WebP, GIF up to {(maxFileSizeBytes / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
