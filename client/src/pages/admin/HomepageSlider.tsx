import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { homepageSlideService } from "@/services/homepageSlideService";
import { type HomepageSlide } from "@shared/homepage-slide-schema";
import { format } from "date-fns";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHomepageSlideSchema } from "@shared/homepage-slide-schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/product/ImageUploader";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function HomepageSlider() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: slides, isLoading } = useQuery({
    queryKey: ["/api/homepage-slides"],
    queryFn: () => homepageSlideService.getAllSlides(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => homepageSlideService.createSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-slides", "active"] });
      toast({ title: "Success", description: "Slide created successfully" });
      setIsAddModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create slide",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HomepageSlide> }) => 
      homepageSlideService.updateSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-slides", "active"] });
      toast({ title: "Updated", description: "Slide updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => homepageSlideService.deleteSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-slides", "active"] });
      toast({ title: "Deleted", description: "Slide deleted successfully" });
    },
  });

  const [selectedHeroType, setSelectedHeroType] = useState<"desktop" | "mobile">("desktop");

  const heroSectionSpecs = {
    desktop: {
      label: "Desktop Hero Section",
      dimensions: "1920 × 700",
      description: "Optimized for desktop and tablet displays",
    },
    mobile: {
      label: "Mobile Hero Section",
      dimensions: "768 × 1024",
      description: "Optimized for mobile devices",
    },
  };

  const form = useForm({
    resolver: zodResolver(insertHomepageSlideSchema),
    defaultValues: {
      image_url: "",
      image_webp_url: "",
      is_active: true,
      display_order: 0,
      hero_section_type: "desktop",
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

  const desktopSlides = useMemo(() => slides?.filter(s => s.hero_section_type === "desktop") || [], [slides]);
  const mobileSlides = useMemo(() => slides?.filter(s => s.hero_section_type === "mobile") || [], [slides]);

  const renderSlideTable = (tableSlides: HomepageSlide[], sectionTitle: string, testIdPrefix: string) => (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="bg-muted/50 px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">{sectionTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tableSlides.length} slide{tableSlides.length !== 1 ? "s" : ""} • 
          {" "}{tableSlides.filter(s => s.is_active).length} active, {tableSlides.filter(s => !s.is_active).length} inactive
        </p>
      </div>
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[120px] py-4">Thumbnail</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Display Order</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableSlides.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                No {sectionTitle.toLowerCase()} slides. Click "Add New Slide" to create one.
              </TableCell>
            </TableRow>
          ) : (
            tableSlides.map((slide) => (
              <TableRow key={slide.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="py-4">
                  <div className="relative group cursor-pointer" onClick={() => window.open(slide.image_url, '_blank')}>
                    <img src={slide.image_url} alt="Slide" className="w-20 h-12 object-cover rounded-lg border shadow-sm" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                      <ImageIcon className="text-white h-4 w-4" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={slide.is_active} 
                      onCheckedChange={(checked) => updateMutation.mutate({ id: slide.id, data: { is_active: checked } })}
                      data-testid={`switch-active-${slide.id}`}
                    />
                    <Badge variant={slide.is_active ? "default" : "secondary"} className="ml-2">
                      {slide.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    className="w-24 bg-transparent border-transparent hover:border-input focus:bg-background transition-all" 
                    defaultValue={slide.display_order}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (val !== slide.display_order) {
                        updateMutation.mutate({ id: slide.id, data: { display_order: val } });
                      }
                    }}
                    data-testid={`input-order-${slide.id}`}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {slide.createdAt ? (() => {
                    try {
                      const date = typeof slide.createdAt === 'object' && 'seconds' in slide.createdAt 
                        ? new Date(slide.createdAt.seconds * 1000)
                        : new Date(slide.createdAt);
                      return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM d, yyyy");
                    } catch (e) {
                      return "Invalid Date";
                    }
                  })() : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if(confirm("Are you sure you want to delete this slide?")) deleteMutation.mutate(slide.id);
                    }}
                    data-testid={`button-delete-${slide.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Homepage Slider Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-slide"><Plus className="mr-2 h-4 w-4" /> Add New Slide</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Slide</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => {
        createMutation.mutate(data);
      }, (errors) => {
        const errorMessages = Object.entries(errors)
          .map(([key, value]: [string, any]) => `${key}: ${value.message}`)
          .join(", ");
        toast({
          title: "Validation Error",
          description: errorMessages || "Please check the form for errors.",
          variant: "destructive",
        });
      })} className="space-y-4">
                <FormField
                  control={form.control}
                  name="hero_section_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Section Type</FormLabel>
                      <Select value={field.value} onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedHeroType(value as "desktop" | "mobile");
                      }}>
                        <FormControl>
                          <SelectTrigger data-testid="select-hero-type">
                            <SelectValue placeholder="Select hero section type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="desktop">Desktop Hero Section (1920 × 700)</SelectItem>
                          <SelectItem value="mobile">Mobile Hero Section (768 × 1024)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="ml-2 text-sm text-blue-900 dark:text-blue-300">
                    <strong>{heroSectionSpecs[selectedHeroType].label}</strong> - Recommended size: <strong>{heroSectionSpecs[selectedHeroType].dimensions}</strong>. {heroSectionSpecs[selectedHeroType].description}
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slide Image</FormLabel>
                      <FormControl>
                        <ImageUploader
                          value={field.value ? [field.value] : []}
                          onChange={(urls) => field.onChange(urls[0] || "")}
                          maxImages={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} data-testid="input-display-order" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-slide">
                  {createMutation.isPending ? "Adding..." : "Add Slide"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {renderSlideTable(desktopSlides, "💻 Computer / Desktop Slides", "desktop")}
        {renderSlideTable(mobileSlides, "📱 Mobile Slides", "mobile")}
      </div>
    </div>
  );
}
