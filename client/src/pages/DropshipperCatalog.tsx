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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MediaDownloadDialog } from "@/components/product/MediaDownloadDialog";
import {
  Download,
  Search,
  Package,
  ExternalLink,
  FileDown,
} from "lucide-react";

const BRAND = "PAKCART";
const SITE_URL = "https://pakcart.store";
const SUPPORT_EMAIL = "support@pakcart.store";

function separator(char = "=", len = 80) {
  return char.repeat(len);
}

function formatProductBlock(product: Product, index?: number): string {
  const lines: string[] = [];
  const label = index !== undefined ? `[${index}] ` : "";

  lines.push(separator());
  lines.push(`${label}${product.name.toUpperCase()}`);
  lines.push(separator("-"));
  lines.push("");

  lines.push(`  Price          : Rs. ${product.price.toLocaleString()}`);
  if (product.originalPrice) {
    const saving = product.originalPrice - product.price;
    const pct = Math.round((saving / product.originalPrice) * 100);
    lines.push(`  Original Price : Rs. ${product.originalPrice.toLocaleString()} (${pct}% off)`);
  }
  if (typeof product.wholesalePrice === "number" && product.wholesalePrice > 0) {
    lines.push(`  Wholesale Price: Rs. ${product.wholesalePrice.toLocaleString()}`);
  }
  lines.push(`  In Stock       : ${product.inStock ? "Yes" : "No"}`);
  lines.push("");

  if (product.description) {
    lines.push("  DESCRIPTION");
    lines.push("  " + separator("-", 40));
    lines.push(`  ${product.description}`);
    lines.push("");
  }

  if (product.longDescription) {
    lines.push("  FULL DESCRIPTION");
    lines.push("  " + separator("-", 40));
    product.longDescription.split("\n").forEach((l) => lines.push(`  ${l}`));
    lines.push("");
  }

  if (product.features && product.features.length > 0) {
    lines.push("  KEY FEATURES");
    lines.push("  " + separator("-", 40));
    product.features.forEach((f) => lines.push(`    • ${f}`));
    lines.push("");
  }

  if (product.specifications && Object.keys(product.specifications).length > 0) {
    lines.push("  SPECIFICATIONS");
    lines.push("  " + separator("-", 40));
    Object.entries(product.specifications).forEach(([k, v]) =>
      lines.push(`    ${k}: ${v}`)
    );
    lines.push("");
  }

  if (product.images && product.images.length > 0) {
    lines.push("  PRODUCT IMAGES");
    lines.push("  " + separator("-", 40));
    product.images.forEach((img, i) => lines.push(`    ${i + 1}. ${img}`));
    lines.push("");
  }

  lines.push("  PRODUCT PAGE");
  lines.push("  " + separator("-", 40));
  lines.push(`    ${SITE_URL}/products/${product.slug}`);
  lines.push("");

  return lines.join("\n");
}

function buildCatalogTxt(products: Product[]): string {
  const now = new Date().toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const header = [
    separator(),
    `${" ".repeat(20)}${BRAND} — DROPSHIPPER PRODUCT CATALOG`,
    `${" ".repeat(20)}${SITE_URL}  |  ${SUPPORT_EMAIL}`,
    separator(),
    "",
    `  Generated  : ${now}`,
    `  Products   : ${products.length}`,
    `  Note       : All prices are in Pakistani Rupees (PKR).`,
    `               Wholesale prices are available on request.`,
    "",
  ].join("\n");

  const body = products
    .map((p, i) => formatProductBlock(p, i + 1))
    .join("\n");

  const footer = [
    separator(),
    `  © ${new Date().getFullYear()} ${BRAND}. For dropshipper use only.`,
    `  Contact us at ${SUPPORT_EMAIL} for wholesale pricing and support.`,
    separator(),
  ].join("\n");

  return `${header}\n${body}\n${footer}`;
}


function downloadTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ProductCatalogCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const imageUrl = product.images?.[0]
    ? getOptimizedImageUrl(product.images[0], { width: 400, height: 400, crop: "fill" })
    : null;

  return (
    <>
    <MediaDownloadDialog
      product={product}
      open={mediaOpen}
      onClose={() => setMediaOpen(false)}
    />
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
            <Badge className="text-xs bg-black/60 text-white border-0 hover:bg-black/60">
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

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs h-8 bg-green-700 hover:bg-green-800 text-white"
            onClick={() => setMediaOpen(true)}
            data-testid={`export-product-${product.id}`}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Link href={`/products/${product.slug}`} target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 shrink-0"
              data-testid={`view-product-${product.id}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </>
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
        <Skeleton className="h-8 w-full mt-2" />
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

  const handleExportAll = () => {
    const content = buildCatalogTxt(filtered);
    const date = new Date().toISOString().slice(0, 10);
    downloadTxt(content, `pakcart-catalog-${date}.txt`);
  };

  return (
    <>
      <SEO
        title="Product Catalog for Dropshippers | PakCart"
        description="Browse PakCart products and export their details as a professional text file to list on your own store."
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
            Browse all available products. Download any product's details as a professionally
            formatted text file — ready to use for your store listings, social posts, or
            WhatsApp messages.
          </p>
        </div>
      </div>

      {/* Search + Export All toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-md">
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

          <Button
            onClick={handleExportAll}
            disabled={isLoading || filtered.length === 0}
            className="bg-green-700 hover:bg-green-800 text-white gap-2 shrink-0 ml-auto"
            data-testid="btn-export-all"
          >
            <FileDown className="h-4 w-4" />
            Export All ({filtered.length})
          </Button>
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

      {/* Info banner */}
      <div className="bg-green-50 border-t border-green-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-green-800 max-w-2xl">
          <strong>How to use:</strong> Click <strong>"Download"</strong> on any product to
          export its details as a .txt file and download product photos, variant images, and
          videos. Use <strong>"Export All"</strong> in the toolbar to download your entire
          catalog details in one file.
        </div>
      </div>
    </>
  );
}
