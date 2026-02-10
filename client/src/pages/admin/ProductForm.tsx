import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type InsertProduct, type Category } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { MediaUpload } from "@/components/MediaUpload";
import { CloudinaryImage } from "@/components/CloudinaryImage";
import { useEffect } from "react";

export default function AdminProductForm() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = params?.id ? parseInt(params.id) : null;
  const isEditing = !!id;

  const { data: product, isLoading: isProductLoading } = useQuery<Product>({
    queryKey: [`/api/products-by-id/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const products: Product[] = await res.json();
      const p = products.find(p => p.id === id);
      if (!p) throw new Error("Product not found");
      return p;
    },
    enabled: isEditing,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      longDescription: "",
      price: 0,
      originalPrice: 0,
      images: [],
      categoryId: undefined,
      inStock: true,
      rating: "0",
      reviewCount: 0,
      features: [],
      specifications: {},
    },
  });

  // Handle features array
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features" as any,
  });

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        images: product.images || [],
        categoryId: product.categoryId ?? undefined,
        rating: product.rating || "0",
        reviewCount: product.reviewCount || 0,
        features: product.features || [],
        specifications: product.specifications || {},
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (isEditing) {
        await apiRequest("PATCH", `/api/products/${id}`, data);
      } else {
        await apiRequest("POST", `/api/products`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: `Successfully ${isEditing ? "updated" : "created"} the product.`,
      });
      setLocation("/admin/products");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Auto-generate slug from name
  const name = form.watch("name");
  useEffect(() => {
    if (!isEditing && name) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [name, isEditing, form]);

  const onSubmit = (data: InsertProduct) => {
    mutation.mutate(data);
  };

  if (isEditing && isProductLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Product" : "New Product"}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Kashmiri Pashmina Shawl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. kashmiri-pashmina-shawl" {...field} />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for the product URL.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief overview of the product..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed product information..." 
                            className="min-h-[200px]"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-4">
                            <MediaUpload 
                              multiple={true}
                              folder="products"
                              onUploadComplete={(results) => {
                                const newUrls = Array.isArray(results) 
                                  ? results.map(r => r.secure_url)
                                  : [results.secure_url];
                                field.onChange([...(field.value || []), ...newUrls]);
                              }}
                            />
                            {field.value && field.value.length > 0 && (
                              <div className="grid grid-cols-3 gap-4 mt-4">
                                {field.value.map((url: string, index: number) => (
                                  <div key={index} className="relative group">
                                    <img 
                                      src={url} 
                                      alt={`Product ${index}`} 
                                      className="w-full h-24 object-cover rounded-md border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        const newVal = [...field.value];
                                        newVal.splice(index, 1);
                                        field.onChange(newVal);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle>Features & Specifications</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => appendFeature("")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Key Features</FormLabel>
                    {featureFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input 
                          {...form.register(`features.${index}` as any)} 
                          placeholder="e.g. Hand-woven using traditional methods"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {featureFields.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No features added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₨)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (₨) - Optional</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value || ""}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">In Stock</FormLabel>
                          <FormDescription>
                            Toggle availability of this product.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(parseInt(val))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={mutation.isPending}
                  data-testid="button-save-product"
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? "Update Product" : "Create Product"}
                </Button>
                <Link href="/admin/products">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
