import SEO from "@/components/SEO";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { announcementService } from "@/services/announcementService";
import {
  type Announcement,
  type InsertAnnouncement,
  insertAnnouncementSchema,
  announcementTypeEnum,
} from "@shared/announcement-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Megaphone } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  info: "Info",
  promo: "Promo",
  warning: "Warning",
  success: "Success",
};

const TYPE_BADGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  info: "default",
  promo: "secondary",
  warning: "destructive",
  success: "outline",
};

const QUERY_KEY = ["/api/announcements"];

type AnnouncementFormData = InsertAnnouncement;

function AnnouncementForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: {
  defaultValues: AnnouncementFormData;
  onSubmit: (data: AnnouncementFormData) => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const { toast } = useToast();
  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(insertAnnouncementSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          const messages = Object.entries(errors)
            .map(([k, v]: [string, any]) => `${k}: ${v.message}`)
            .join(", ");
          toast({
            title: "Validation Error",
            description: messages || "Please check the form for errors.",
            variant: "destructive",
          });
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter announcement text (max 300 characters)"
                  rows={3}
                  {...field}
                  data-testid="input-announcement-message"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="select-announcement-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {announcementTypeEnum.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {TYPE_LABELS[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    data-testid="input-announcement-order"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="link_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link URL (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://pakcart.store/..."
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value || null)
                  }
                  data-testid="input-announcement-link-url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Text (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Shop Now"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value || null)
                  }
                  data-testid="input-announcement-link-text"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-announcement-active"
                />
              </FormControl>
              <FormLabel className="!mt-0">Active (visible on site)</FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          data-testid="button-submit-announcement"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => announcementService.getAnnouncements(),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertAnnouncement) =>
      announcementService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Created", description: "Announcement created successfully." });
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) =>
      announcementService.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Updated", description: "Announcement updated successfully." });
      setEditTarget(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Deleted", description: "Announcement deleted." });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement.",
        variant: "destructive",
      });
    },
  });

  const createDefaults: AnnouncementFormData = {
    message: "",
    type: "info",
    is_active: true,
    display_order: 0,
    link_url: null,
    link_text: null,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SEO title="Admin Announcements - PakCart" robots="noindex,follow" />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Announcements</h1>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-add-announcement"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Announcement
        </Button>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/50 px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">All Announcements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {announcements?.length ?? 0} announcement
            {announcements?.length !== 1 ? "s" : ""} &bull;{" "}
            {announcements?.filter((a) => a.is_active).length ?? 0} active,{" "}
            {announcements?.filter((a) => !a.is_active).length ?? 0} inactive
          </p>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[40%]">Message</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!announcements || announcements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  No announcements yet. Click "Add Announcement" to create one.
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow
                  key={announcement.id}
                  className="hover:bg-muted/30 transition-colors"
                  data-testid={`row-announcement-${announcement.id}`}
                >
                  <TableCell className="py-4 max-w-xs">
                    <p className="text-sm leading-snug line-clamp-2">
                      {announcement.message}
                    </p>
                    {announcement.link_url && (
                      <a
                        href={announcement.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline mt-1 block truncate"
                        data-testid={`link-announcement-${announcement.id}`}
                      >
                        {announcement.link_text || announcement.link_url}
                      </a>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        TYPE_BADGE_VARIANTS[announcement.type] ?? "default"
                      }
                    >
                      {TYPE_LABELS[announcement.type] ?? announcement.type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={announcement.is_active}
                        onCheckedChange={(checked) =>
                          updateMutation.mutate({
                            id: announcement.id,
                            data: { is_active: checked },
                          })
                        }
                        data-testid={`switch-active-${announcement.id}`}
                      />
                      <Badge
                        variant={
                          announcement.is_active ? "default" : "secondary"
                        }
                      >
                        {announcement.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      className="w-20 bg-transparent border-transparent hover:border-input focus:bg-background transition-all"
                      defaultValue={announcement.display_order}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (val !== announcement.display_order) {
                          updateMutation.mutate({
                            id: announcement.id,
                            data: { display_order: val },
                          });
                        }
                      }}
                      data-testid={`input-order-${announcement.id}`}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(announcement)}
                        data-testid={`button-edit-${announcement.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this announcement?"
                            )
                          ) {
                            deleteMutation.mutate(announcement.id);
                          }
                        }}
                        data-testid={`button-delete-${announcement.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Announcement</DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            defaultValues={createDefaults}
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
            submitLabel="Create Announcement"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <AnnouncementForm
              defaultValues={{
                message: editTarget.message,
                type: editTarget.type,
                is_active: editTarget.is_active,
                display_order: editTarget.display_order,
                link_url: editTarget.link_url ?? null,
                link_text: editTarget.link_text ?? null,
              }}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editTarget.id, data })
              }
              isPending={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
