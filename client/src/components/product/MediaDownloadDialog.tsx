import { useState, useMemo } from "react";
import { type Product } from "@shared/schema";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Images, Video, Loader2, CheckCircle2, Layers } from "lucide-react";

async function downloadMediaFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank");
  }
}

interface VariantImage {
  url: string;
  variantName: string;
  optionValue: string;
}

interface MediaDownloadDialogProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export function MediaDownloadDialog({ product, open, onClose }: MediaDownloadDialogProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, "-");

  const variantImages = useMemo<VariantImage[]>(() => {
    if (!product.variants) return [];
    const result: VariantImage[] = [];
    for (const variant of product.variants) {
      for (const option of variant.options) {
        if (option.image) {
          result.push({
            url: option.image,
            variantName: variant.name,
            optionValue: option.value,
          });
        }
      }
    }
    return result;
  }, [product.variants]);

  const variantsByName = useMemo(() => {
    const map = new Map<string, VariantImage[]>();
    for (const vi of variantImages) {
      const existing = map.get(vi.variantName) || [];
      existing.push(vi);
      map.set(vi.variantName, existing);
    }
    return map;
  }, [variantImages]);

  const handleDownload = async (url: string, filename: string) => {
    setDownloading(url);
    await downloadMediaFile(url, filename);
    setDownloading(null);
    setDone((prev) => new Set(prev).add(url));
  };

  const handleDownloadAll = async () => {
    const allImages = product.images || [];
    for (let i = 0; i < allImages.length; i++) {
      await handleDownload(allImages[i], `pakcart-${slug}-image-${i + 1}.jpg`);
    }
    for (let i = 0; i < variantImages.length; i++) {
      const vi = variantImages[i];
      const safeName = vi.optionValue.toLowerCase().replace(/\s+/g, "-");
      await handleDownload(vi.url, `pakcart-${slug}-variant-${vi.variantName.toLowerCase()}-${safeName}.jpg`);
    }
    if (product.videoUrl) {
      await handleDownload(product.videoUrl, `pakcart-${slug}-video.mp4`);
    }
  };

  const totalMedia =
    (product.images?.length || 0) +
    variantImages.length +
    (product.videoUrl ? 1 : 0);

  const ImageTile = ({
    url,
    label,
    filename,
    testId,
  }: {
    url: string;
    label: string;
    filename: string;
    testId: string;
  }) => (
    <div
      className="relative rounded-lg border border-gray-200 overflow-hidden group bg-gray-50"
      data-testid={testId}
    >
      <div className="aspect-square">
        <img
          src={getOptimizedImageUrl(url, { width: 200, height: 200, crop: "fill" })}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          size="sm"
          className="gap-1.5 text-xs h-7 bg-white text-gray-900 hover:bg-gray-100"
          onClick={() => handleDownload(url, filename)}
          disabled={downloading === url}
        >
          {downloading === url ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : done.has(url) ? (
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          ) : (
            <Download className="h-3 w-3" />
          )}
          {done.has(url) ? "Saved" : "Download"}
        </Button>
      </div>
      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5 max-w-[80%] truncate">
        {label}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-tight pr-4">
            Download Media — {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">
            {totalMedia} file{totalMedia !== 1 ? "s" : ""} available
          </p>
          {totalMedia > 1 && (
            <Button
              size="sm"
              className="bg-green-700 hover:bg-green-800 text-white gap-1.5"
              onClick={handleDownloadAll}
              disabled={!!downloading}
              data-testid="btn-download-all-media"
            >
              {downloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download All
            </Button>
          )}
        </div>

        {product.images && product.images.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Images className="h-4 w-4 text-green-700" />
              <span className="text-sm font-medium">
                Product Images ({product.images.length})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.images.map((img, i) => (
                <ImageTile
                  key={i}
                  url={img}
                  label={`Photo ${i + 1}`}
                  filename={`pakcart-${slug}-image-${i + 1}.jpg`}
                  testId={`media-image-${product.id}-${i}`}
                />
              ))}
            </div>
          </div>
        )}

        {variantsByName.size > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-green-700" />
              <span className="text-sm font-medium">
                Variant Images ({variantImages.length})
              </span>
            </div>
            <div className="space-y-4">
              {Array.from(variantsByName.entries()).map(([variantName, items]) => (
                <div key={variantName}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {variantName}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {items.map((vi, i) => {
                      const safeName = vi.optionValue.toLowerCase().replace(/\s+/g, "-");
                      return (
                        <ImageTile
                          key={i}
                          url={vi.url}
                          label={vi.optionValue}
                          filename={`pakcart-${slug}-variant-${variantName.toLowerCase()}-${safeName}.jpg`}
                          testId={`media-variant-${product.id}-${variantName}-${i}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.videoUrl && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-green-700" />
              <span className="text-sm font-medium">Video</span>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <video
                src={product.videoUrl}
                controls
                className="w-full max-h-64 object-contain"
              />
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Product video</span>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs h-7 bg-green-700 hover:bg-green-800 text-white"
                  onClick={() => handleDownload(product.videoUrl!, `pakcart-${slug}-video.mp4`)}
                  disabled={downloading === product.videoUrl}
                  data-testid={`btn-download-video-${product.id}`}
                >
                  {downloading === product.videoUrl ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : done.has(product.videoUrl) ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  {done.has(product.videoUrl) ? "Saved" : "Download Video"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {totalMedia === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No media available for this product.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
