import { useQuery, useMutation } from "@tanstack/react-query";
import { heroFirestoreService } from "@/services/heroFirestoreService";
import { type HeroSlide, insertHeroSlideSchema } from "@shared/hero-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Save, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MediaUpload } from "@/components/MediaUpload";

export default function HeroManager() {
  const { toast } = useToast();
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: slides, isLoading } = useQuery<HeroSlide[]>({
    queryKey: ["hero-slides"],
    queryFn: () => heroFirestoreService.getAllSlides(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => heroFirestoreService.createSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast({ title: "Success", description: "Slide created successfully" });
      setIsDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => heroFirestoreService.updateSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast({ title: "Success", description: "Slide updated successfully" });
      setIsDialogOpen(false);
      setEditingSlide(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => heroFirestoreService.deleteSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast({ title: "Success", description: "Slide deleted successfully" });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertHeroSlideSchema),
    defaultValues: {
      image: "",
      title: "",
      subtitle: "",
      buttonText: "Shop Now",
      buttonLink: "/products",
      order: 0,
      active: true,
    },
  });

  const onSubmit = (data: any) => {
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    form.reset({
      image: slide.image,
      title: slide.title,
      subtitle: slide.subtitle,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      order: slide.order,
      active: slide.active,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Slides</h1>
          <p className="text-muted-foreground">Manage the homepage hero carousel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSlide(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSlide ? "Edit Slide" : "Add New Slide"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slide Image</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value && (
                            <img src={field.value} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                          )}
                          <MediaUpload
                            onUploadSuccess={(url) => field.onChange(url)}
                            onUploadError={(err) => toast({ title: "Upload Failed", description: err, variant: "destructive" })}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="buttonLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Link</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingSlide ? "Update Slide" : "Create Slide"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides?.map((slide) => (
          <Card key={slide.id} className={!slide.active ? "opacity-60" : ""}>
            <div className="relative aspect-video">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover rounded-t-xl" />
              {!slide.active && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold uppercase">Inactive</span>
                </div>
              )}
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg truncate">{slide.title}</CardTitle>
              <CardDescription className="truncate">{slide.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">Order: {slide.order}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(slide)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-destructive" onClick={() => {
                  if (confirm("Are you sure you want to delete this slide?")) {
                    deleteMutation.mutate(slide.id);
                  }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
