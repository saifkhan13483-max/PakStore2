import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type InsertProduct, type Category } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Loader2, Save, Plus, Trash2, TrendingUp, Layers } from "lucide-react";
import { Link } from "wouter";
import { ImageUploader } from "@/components/product/ImageUploader";
import { VideoUpload } from "@/components/VideoUpload";
import { useEffect, Fragment } from "react";
import { productFirestoreService } from "@/services/productFirestoreService";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";

export default function AdminProductForm() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = params?.id ? params.id : null;
  const isEditing = !!id;

  const { data: product, isLoading: isProductLoading } = useQuery<Product | null>({
    queryKey: ["products", id],
    queryFn: () => productFirestoreService.getProductById(id!),
    enabled: isEditing,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories(),
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
      videoUrl: "",
      categoryId: "",
      stock: 0,
      active: true,
      inStock: true,
      rating: 0,
      reviewCount: 0,
      features: [],
      specifications: {},
      variants: [],
    },
  });

  // Handle features array
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features" as any,
  });

  // Handle variants array
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants" as any,
  });

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        images: product.images || [],
        videoUrl: product.videoUrl || "",
        categoryId: product.categoryId ? String(product.categoryId) : "",
        rating: typeof product.rating === 'string' ? parseFloat(product.rating) : (product.rating || 0),
        reviewCount: product.reviewCount || 0,
        features: product.features || [],
        specifications: product.specifications || {},
        variants: product.variants || [],
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (isEditing && id) {
        await productFirestoreService.updateProduct(id, data);
      } else {
        await productFirestoreService.createProduct(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
    <div className="space-y-8 p-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/products">
                <Button variant="outline" size="icon" className="h-9 w-9 hover-elevate shadow-sm border-emerald-200 text-emerald-700">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-emerald-950">
                  {isEditing ? "Edit Product" : "New Product"}
                </h2>
                <p className="text-emerald-600/70 text-sm font-medium">
                  {isEditing ? "Modify your product details and availability" : "Add a new item to your store inventory"}
                </p>
              </div>
            </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-emerald-100 bg-emerald-50/10 backdrop-blur-sm shadow-sm">
                <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
                  <CardTitle className="text-xl text-emerald-900">Basic Information</CardTitle>
                  <CardDescription>Primary details that customers will see first</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 font-semibold text-emerald-900">
                            Product Name
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Kashmiri Pashmina Shawl" className="bg-background/50 focus-visible:ring-emerald-500 border-emerald-100" {...field} />
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
                          <FormLabel className="font-semibold text-emerald-900">Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. kashmiri-pashmina-shawl" className="bg-background/50 font-mono text-xs focus-visible:ring-emerald-500 border-emerald-100" {...field} />
                          </FormControl>
                          <FormDescription className="text-[10px] text-emerald-600/70">URL-friendly identifier</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief overview of the product..." 
                            className="min-h-[80px] bg-background/50"
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
                            className="min-h-[180px] bg-background/50"
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

              <Card className="border-emerald-100 bg-emerald-50/10 backdrop-blur-sm shadow-sm">
                <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
                  <CardTitle className="text-xl text-emerald-900">Product Media</CardTitle>
                  <CardDescription>Upload images and a product video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Images (Max 15)</FormLabel>
                        <FormControl>
                          <ImageUploader 
                            value={field.value || []}
                            onChange={(urls) => field.onChange(urls)}
                            maxImages={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Video</FormLabel>
                        <FormControl>
                          <VideoUpload 
                            onUploadComplete={(data) => field.onChange(data.secure_url)}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>Upload a product demonstration video</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-emerald-100 bg-emerald-50/10 backdrop-blur-sm shadow-sm overflow-visible">
                <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 flex flex-row items-center justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2 text-emerald-900">
                      <Layers className="h-5 w-5" />
                      Product Variants
                    </CardTitle>
                    <CardDescription>Add options like Color, Size, or Material</CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => appendVariant({ id: Math.random().toString(36).substr(2, 9), name: "", options: [] })}
                    className="hover-elevate bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Variant Type
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {variantFields.map((variant, vIndex) => (
                    <div key={variant.id} className="p-4 rounded-xl border border-border/50 bg-background/30 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`variants.${vIndex}.name` as any}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Variant Type Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Color" className="bg-background/50 h-8" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeVariant(vIndex)}
                          className="mt-6 text-muted-foreground hover:text-destructive hover-elevate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Options</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-primary hover:bg-transparent"
                            onClick={() => {
                              const options = form.getValues(`variants.${vIndex}.options` as any) || [];
                              form.setValue(`variants.${vIndex}.options` as any, [
                                ...options,
                                { id: Math.random().toString(36).substr(2, 9), value: "" }
                              ]);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Option
                          </Button>
                        </div>
                        
                        <div className="grid gap-2">
                          {(form.watch(`variants.${vIndex}.options` as any) || []).map((option: any, oIndex: number) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`variants.${vIndex}.options.${oIndex}.value` as any}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input placeholder="e.g. Gold" className="bg-background/50 h-9" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`variants.${vIndex}.options.${oIndex}.price` as any}
                                render={({ field }) => (
                                  <FormItem className="w-24">
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="Price" 
                                        className="bg-background/50 h-9" 
                                        {...field} 
                                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`variants.${vIndex}.options.${oIndex}.image` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <ImageUploader
                                        value={field.value ? [field.value] : []}
                                        onChange={(urls) => field.onChange(urls[0])}
                                        maxImages={1}
                                        compact
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  const options = form.getValues(`variants.${vIndex}.options` as any);
                                  form.setValue(`variants.${vIndex}.options` as any, options.filter((_: any, i: number) => i !== oIndex));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {variantFields.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl border-muted/20">
                      <Layers className="h-10 w-10 text-muted/20 mb-3" />
                      <p className="text-sm text-muted-foreground">No variants added. Perfect for simple products.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm overflow-visible">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Features</CardTitle>
                    <CardDescription>Add key selling points for your product</CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => appendFeature("")}
                    className="hover-elevate"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {featureFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 group">
                        <Input 
                          {...form.register(`features.${index}` as any)} 
                          placeholder="e.g. Hand-woven using traditional methods"
                          className="bg-background/50"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeFeature(index)}
                          className="text-muted-foreground hover:text-destructive hover-elevate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {featureFields.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg border-muted/20">
                        <Plus className="h-8 w-8 text-muted/20 mb-2" />
                        <p className="text-sm text-muted-foreground italic">No features added yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="border-emerald-100 bg-emerald-50/10 backdrop-blur-sm shadow-sm">
                <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
                  <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Pricing & Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price (₨)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              className="bg-background/50 font-bold text-lg"
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
                          <FormLabel>Original Price (₨) <span className="text-muted-foreground text-xs font-normal">(Optional)</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              className="bg-background/50 text-muted-foreground"
                              {...field} 
                              value={field.value || ""}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl bg-background/50 p-4 border border-border/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Availability</FormLabel>
                            <p className="text-xs text-muted-foreground">Is this item ready for sale?</p>
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
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-emerald-900">Category</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(val)} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-emerald-100 focus:ring-emerald-500">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={String(category.id)}>
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

              <div className="flex flex-col gap-3 sticky bottom-4 z-50">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.98]" 
                  disabled={mutation.isPending}
                  data-testid="button-save-product"
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  {isEditing ? "Save Changes" : "Publish Product"}
                </Button>
                <Link href="/admin/products">
                  <Button variant="ghost" type="button" className="w-full h-11 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold transition-colors">
                    Cancel & Discard
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
