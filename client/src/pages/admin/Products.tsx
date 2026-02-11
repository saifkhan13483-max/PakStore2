import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2,
  Package,
  Copy,
  AlertTriangle,
  SlidersHorizontal,
  X,
  Eraser,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from "react";
import { Product, Category } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { productFirestoreService } from "@/services/productFirestoreService";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const { toast } = useToast();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", categoryFilter],
    queryFn: () => productFirestoreService.getAllProducts({
      category: categoryFilter === "all" ? undefined : categoryFilter as any,
    }),
  });

  const products = Array.isArray(productsData) ? productsData : [];

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await productFirestoreService.deleteProduct(id.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { id, ...rest } = product;
      const duplicatedProduct = {
        ...rest,
        name: `${rest.name} (Copy)`,
        slug: `${rest.slug}-copy-${Date.now()}`,
      };
      return await productFirestoreService.createProduct(duplicatedProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product duplicated",
        description: "A copy of the product has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate product.",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (product.slug?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "in_stock" && product.inStock) || 
        (stockFilter === "low_stock" && product.inStock && (product.reviewCount || 0) < 5) ||
        (stockFilter === "out_of_stock" && !product.inStock);

      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesStock && matchesPrice;
    });
  }, [products, searchTerm, stockFilter, priceRange]);

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockFilter("all");
    setPriceRange([0, 100000]);
  };

  const isLowStock = (product: Product) => {
    // Mock logic for low stock warning: inStock is true but reviewCount is low
    return product.inStock && (product.reviewCount || 0) < 5;
  };

  const clearAllProductsMutation = useMutation({
    mutationFn: async () => {
      // Since we don't have a direct route yet, we'll delete them one by one if needed
      // but the user asked for a "clear all" option.
      // Assuming productFirestoreService might need this method too.
      // For now, let's implement the UI and try to use a bulk delete if available.
      if (typeof (productFirestoreService as any).deleteAllProducts === 'function') {
        await (productFirestoreService as any).deleteAllProducts();
      } else {
        // Fallback: Delete each filtered product
        await Promise.all(products.map(p => productFirestoreService.deleteProduct(p.id)));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "All products cleared",
        description: "Your product catalog has been emptied.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear products.",
        variant: "destructive",
      });
    },
  });

  const handleClearAll = () => {
    if (confirm("WARNING: This will permanently delete ALL products in your store. This action cannot be undone. Are you sure?")) {
      clearAllProductsMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog, prices, and stock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
              onClick={handleClearAll}
              disabled={clearAllProductsMutation.isPending}
            >
              {clearAllProductsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eraser className="mr-2 h-4 w-4" />
              )}
              Clear All
            </Button>
          )}
          <Link href="/admin/products/new">
            <Button data-testid="button-add-product">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-products"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Refine your product list with specific criteria.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Status</label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Price Range (PKR)</label>
                    <span className="text-xs text-muted-foreground font-mono">
                      ₨ {priceRange[0].toLocaleString()} - ₨ {priceRange[1].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={priceRange}
                    max={100000}
                    step={1000}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground" 
                  onClick={resetFilters}
                >
                  <X className="mr-2 h-4 w-4" /> Reset All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Info</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price (PKR)</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-10 w-10 rounded-md bg-muted animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                  <TableCell><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8 opacity-20" />
                    <span>No products found matching your criteria.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px]">{product.name || 'Unnamed Product'}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {categories?.find(c => String(c.id) === String(product.categoryId) || c.slug === product.categoryId)?.name || product.categoryId || 'Uncategorized'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {product.slug.split('-').slice(0, 2).join('-').toUpperCase()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₨ {product.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {!product.inStock ? (
                        <Badge variant="destructive" className="w-fit">Out of Stock</Badge>
                      ) : isLowStock(product) ? (
                        <Badge variant="outline" className="w-fit text-amber-600 border-amber-200 bg-amber-50 gap-1">
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit text-green-600 border-green-200 bg-green-50">
                          Active
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-actions-${product.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${product.slug}`}>
                            <div className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> View Live
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <div className="flex items-center cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateMutation.mutate(product)}>
                          <div className="flex items-center cursor-pointer">
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
