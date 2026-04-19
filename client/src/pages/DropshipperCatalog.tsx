import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { productFirestoreService } from "@/services/productFirestoreService";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { type Product } from "@shared/schema";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Copy,
  Check,
  Search,
  Package,
  ImageIcon,
  FileText,
  Tag,
  Layers,
  ExternalLink,
} from "lucide-react";

function useCopyState() {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const copy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      toast({ title: `${label} copied!`, description: "Pasted to your clipboard." });
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return { copied, copy };
}

interface CopyButtonProps {
  label: string;
  icon: React.ReactNode;
  text: string;
  copyKey: string;
  copied: string | null;
  onCopy: (text: string, key: string, label: string) => void;
  variant?: "outline" | "secondary";
}

function CopyButton({ label, icon, text, copyKey, copied, onCopy, variant = "outline" }: CopyButtonProps) {
  const isCopied = copied === copyKey;
  return (
    <Button
      size="sm"
      variant={isCopied ? "secondary" : variant}
      className={`gap-1.5 text-xs h-7 px-2.5 ${isCopied ? "text-green-700 border-green-300 bg-green-50" : ""}`}
      onClick={() => onCopy(text, copyKey, label)}
      data-testid={`copy-${copyKey}`}
    >
      {isCopied ? <Check className="h-3 w-3 text-green-600" /> : icon}
      {isCopied ? "Copied!" : label}
    </Button>
  );
}

function ProductCatalogCard({ product }: { product: Product }) {
  const { copied, copy } = useCopyState();
  const [imgError, setImgError] = useState(false);

  const imageUrl = product.images?.[0]
    ? getOptimizedImageUrl(product.images[0], { width: 400, height: 400, crop: "fill" })
    : null;

  const allDetails = [
    `Product Name: ${product.name}`,
    `Price: Rs. ${product.price.toLocaleString()}`,
    product.originalPrice ? `Original Price: Rs. ${product.originalPrice.toLocaleString()}` : null,
    `\nDescription:\n${product.description}`,
    product.longDescription ? `\nFull Description:\n${product.longDescription}` : null,
    product.features?.length
      ? `\nKey Features:\n${product.features.map((f) => `• ${f}`).join("\n")}`
      : null,
    product.images?.length
      ? `\nProduct Images:\n${product.images.join("\n")}`
      : null,
    `\nProduct Page: https://pakcart.store/products/${product.slug}`,
  ]
    .filter(Boolean)
    .join("\n");

  const featuresText = product.features?.length
    ? product.features.map((f) => `• ${f}`).join("\n")
    : "";

  const imagesText = product.images?.join("\n") ?? "";

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      data-testid={`catalog-card-${product.id}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
              {product.images.length} photos
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-green-700 font-bold text-base">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Copy Buttons */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-100">
          <CopyButton
            label="Name"
            icon={<Tag className="h-3 w-3" />}
            text={product.name}
            copyKey={`${product.id}-name`}
            copied={copied}
            onCopy={copy}
          />
          <CopyButton
            label="Description"
            icon={<FileText className="h-3 w-3" />}
            text={product.description}
            copyKey={`${product.id}-desc`}
            copied={copied}
            onCopy={copy}
          />
          <CopyButton
            label="Price"
            icon={<Tag className="h-3 w-3" />}
            text={`Rs. ${product.price.toLocaleString()}`}
            copyKey={`${product.id}-price`}
            copied={copied}
            onCopy={copy}
          />
          {product.images?.length ? (
            <CopyButton
              label="Images"
              icon={<ImageIcon className="h-3 w-3" />}
              text={imagesText}
              copyKey={`${product.id}-images`}
              copied={copied}
              onCopy={copy}
            />
          ) : null}
          {featuresText && (
            <CopyButton
              label="Features"
              icon={<Layers className="h-3 w-3" />}
              text={featuresText}
              copyKey={`${product.id}-features`}
              copied={copied}
              onCopy={copy}
            />
          )}
        </div>

        {/* Copy All + View */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className={`flex-1 gap-1.5 text-xs h-8 ${
              copied === `${product.id}-all`
                ? "bg-green-700 hover:bg-green-800"
                : "bg-green-700 hover:bg-green-800"
            } text-white`}
            onClick={() => copy(allDetails, `${product.id}-all`, "All product details")}
            data-testid={`copy-all-${product.id}`}
          >
            {copied === `${product.id}-all` ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied === `${product.id}-all` ? "Copied!" : "Copy All Details"}
          </Button>
          <Link href={`/products/${product.slug}`} target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              data-testid={`view-product-${product.id}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-1.5 pt-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-14" />
        </div>
        <Skeleton className="h-8 w-full mt-1" />
      </div>
    </div>
  );
}

export default function DropshipperCatalog() {
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["dropshipper-catalog-products"],
    queryFn: () => productFirestoreService.getAllProducts({ limit: 200 }),
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    const active = products.filter((p) => p.active !== false && p.inStock !== false);
    if (!search.trim()) return active;
    const q = search.toLowerCase();
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q))
    );
  }, [products, search]);

  return (
    <>
      <SEO
        title="Product Catalog for Dropshippers | PakCart"
        description="Browse PakCart products and copy product details to list on your own store. Name, description, price, and images — all in one click."
        url="https://pakcart.store/dropshipper/catalog"
        robots="noindex,follow"
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <Breadcrumb className="mb-5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-green-200 hover:text-white">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-green-400" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dropshipper" className="text-green-200 hover:text-white">
                  Dropshipper Program
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-green-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Product Catalog</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Product Catalog</h1>
          <p className="text-green-200 max-w-xl">
            Browse all available products and copy their details — name, description, price,
            and images — to list on your own store or social page.
          </p>
        </div>
      </div>

      {/* Search + Count */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-catalog-search"
            />
          </div>
          {!isLoading && (
            <span className="text-sm text-muted-foreground shrink-0">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            {search && (
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((product) => (
              <ProductCatalogCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Tip banner */}
      <div className="bg-green-50 border-t border-green-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-green-800 max-w-2xl">
          <strong>How to use:</strong> Click any copy button to copy individual details, or use{" "}
          <strong>"Copy All Details"</strong> to get everything formatted and ready to paste into
          your store listing, WhatsApp message, or Facebook post.
        </div>
      </div>
    </>
  );
}
