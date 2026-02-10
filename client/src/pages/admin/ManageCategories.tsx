import { useQuery, useMutation } from "@tanstack/react-query";
import { ParentCategory, Category, insertCategorySchema, insertParentCategorySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";

export default function ManageCategories() {
  const { toast } = useToast();
  const [editingParent, setEditingParent] = useState<ParentCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
      setEditingParent(null);
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
    mutationFn: (data: any) => categoryFirestoreService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Success", description: "Category created" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      categoryFirestoreService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
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
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Parent Categories</CardTitle>
            <ParentCategoryDialog onSubmit={(data) => createParentMutation.mutate(data)} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parentCategories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{cat.name}</span>
                  <div className="flex gap-2">
                    <ParentCategoryDialog 
                      category={cat} 
                      onSubmit={(data) => updateParentMutation.mutate({ id: cat.id.toString(), data })} 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteParentMutation.mutate(cat.id.toString())}
                      disabled={deleteParentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sub-Categories</CardTitle>
            <CategoryDialog 
              parentCategories={parentCategories || []} 
              onSubmit={(data) => createCategoryMutation.mutate(data)} 
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({parentCategories?.find(p => p.id === cat.parentId)?.name})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <CategoryDialog 
                      category={cat}
                      parentCategories={parentCategories || []}
                      onSubmit={(data) => updateCategoryMutation.mutate({ id: cat.id.toString(), data })} 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteCategoryMutation.mutate(cat.id.toString())}
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ParentCategoryDialog({ category, onSubmit }: { category?: ParentCategory; onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(insertParentCategorySchema),
    defaultValues: category || { name: "", slug: "" },
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={category ? "icon" : "sm"} variant={category ? "ghost" : "default"}>
          {category ? <Edit2 className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {!category && "Add Parent"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Add"} Parent Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. watches" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryDialog({ category, parentCategories, onSubmit }: { category?: Category; parentCategories: ParentCategory[]; onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: category || { name: "", slug: "", parentId: undefined },
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={category ? "icon" : "sm"} variant={category ? "ghost" : "default"}>
          {category ? <Edit2 className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {!category && "Add Sub-Category"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Add"} Sub-Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. luxury-watches" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val)} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent" />
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
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
