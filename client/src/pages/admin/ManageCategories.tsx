import { useQuery, useMutation } from "@tanstack/react-query";
import { ParentCategory, Category, insertCategorySchema, insertParentCategorySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Loader2, FolderTree, Tag, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function ManageCategories() {
  const { toast } = useToast();

  const { data: parentCategories, isLoading: loadingParents } = useQuery<ParentCategory[]>({
    queryKey: ["parent-categories"],
    queryFn: () => categoryFirestoreService.getAllParentCategories(),
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories(),
  });

  const createParentMutation = useMutation({
    mutationFn: (data: any) => categoryFirestoreService.createParentCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-categories"] });
      toast({ title: "Success", description: "Parent category created" });
    },
  });

  const updateParentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      categoryFirestoreService.updateParentCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-categories"] });
      toast({ title: "Success", description: "Parent category updated" });
    },
  });

  const deleteParentMutation = useMutation({
    mutationFn: (id: string) => categoryFirestoreService.deleteParentCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-categories"] });
      toast({ title: "Success", description: "Parent category deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => {
      const { parentCategoryId, ...rest } = data;
      return categoryFirestoreService.createCategory({
        ...rest,
        parentCategoryId: parentCategoryId === "" ? null : parentCategoryId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Success", description: "Category created" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const { parentCategoryId, ...rest } = data;
      return categoryFirestoreService.updateCategory(id, {
        ...rest,
        parentCategoryId: parentCategoryId === "" ? null : parentCategoryId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Success", description: "Category updated" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryFirestoreService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Success", description: "Category deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (loadingParents || loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
        <p className="text-muted-foreground">
          Organize your product hierarchy by managing parent categories and their sub-categories.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Parent Categories Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Parent Categories</h2>
              <Badge variant="secondary" className="ml-2">
                {parentCategories?.length || 0}
              </Badge>
            </div>
            <ParentCategoryDialog 
              onSubmit={(data) => createParentMutation.mutate(data)}
              isPending={createParentMutation.isPending}
            />
          </div>

          <div className="grid gap-4">
            {parentCategories?.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <FolderTree className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No parent categories found.</p>
                </CardContent>
              </Card>
            ) : (
              parentCategories?.map((cat) => (
                <Card key={cat.id} className="hover-elevate transition-all">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">{cat.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">/{cat.slug}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <ParentCategoryDialog 
                        category={cat} 
                        onSubmit={(data) => updateParentMutation.mutate({ id: cat.id.toString(), data })} 
                        isPending={updateParentMutation.isPending}
                      />
                      <DeleteConfirmation 
                        onConfirm={() => deleteParentMutation.mutate(cat.id.toString())}
                        title={`Delete ${cat.name}?`}
                        description="This will permanently remove this parent category. Make sure no sub-categories are assigned to it first."
                        isPending={deleteParentMutation.isPending}
                      />
                    </div>
                  </CardHeader>
                  {cat.description && (
                    <CardContent className="px-4 pb-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Sub-Categories Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Sub-Categories</h2>
              <Badge variant="secondary" className="ml-2">
                {categories?.length || 0}
              </Badge>
            </div>
            <CategoryDialog 
              parentCategories={parentCategories || []} 
              onSubmit={(data) => createCategoryMutation.mutate(data)}
              isPending={createCategoryMutation.isPending}
            />
          </div>

          <div className="grid gap-4">
            {categories?.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Tag className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No sub-categories found.</p>
                </CardContent>
              </Card>
            ) : (
              categories?.map((cat) => (
                <Card key={cat.id} className="hover-elevate transition-all">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{cat.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px] h-4">
                          {parentCategories?.find(p => String(p.id) === String(cat.parentCategoryId))?.name || "Unassigned"}
                        </Badge>
                      </div>
                      <CardDescription className="font-mono text-xs">/{cat.slug}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <CategoryDialog 
                        category={cat}
                        parentCategories={parentCategories || []}
                        onSubmit={(data) => updateCategoryMutation.mutate({ id: cat.id.toString(), data })} 
                        isPending={updateCategoryMutation.isPending}
                      />
                      <DeleteConfirmation 
                        onConfirm={() => deleteCategoryMutation.mutate(cat.id.toString())}
                        title={`Delete ${cat.name}?`}
                        description="This will permanently remove this sub-category and unassign it from any products."
                        isPending={deleteCategoryMutation.isPending}
                      />
                    </div>
                  </CardHeader>
                  {cat.description && (
                    <CardContent className="px-4 pb-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DeleteConfirmation({ onConfirm, title, description, isPending }: { onConfirm: () => void; title: string; description: string; isPending: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:text-destructive transition-colors">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ParentCategoryDialog({ category, onSubmit, isPending }: { category?: ParentCategory; onSubmit: (data: any) => void; isPending: boolean }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(insertParentCategorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      image: category?.image || "",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || undefined,
      });
    }
  }, [category, form.reset]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={category ? "icon" : "sm"} variant={category ? "ghost" : "default"} className={!category ? "shadow-sm" : ""}>
          {category ? <Edit2 className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {!category && "Add Parent"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Create"} Parent Category</DialogTitle>
          <DialogDescription>
            {category ? "Modify the details of this parent category." : "Define a new top-level category for your products."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Watches" />
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
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. watches" />
                  </FormControl>
                  <FormDescription>Used in the browser URL (e.g. /category/watches)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe this category's collections..." className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? "Update" : "Create"} Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryDialog({ category, parentCategories, onSubmit, isPending }: { category?: Category; parentCategories: ParentCategory[]; onSubmit: (data: any) => void; isPending: boolean }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      parentCategoryId: category?.parentCategoryId || "",
      image: category?.image || "",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parentCategoryId: category.parentCategoryId,
        image: (category.image as string | undefined) || undefined,
      });
    }
  }, [category, form.reset]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={category ? "icon" : "sm"} variant={category ? "ghost" : "default"} className={!category ? "shadow-sm" : ""}>
          {category ? <Edit2 className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {!category && "Add Sub-Category"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Create"} Sub-Category</DialogTitle>
          <DialogDescription>
            {category ? "Modify the details of this sub-category." : "Create a new sub-category nested under a parent."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Luxury Watches" />
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
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. luxury-watches" />
                  </FormControl>
                  <FormDescription>Unique identifier for product filtering.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val)} 
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentCategories.map((pc) => (
                        <SelectItem key={pc.id} value={pc.id.toString()}>{pc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe this sub-category..." className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? "Update" : "Create"} Sub-Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
