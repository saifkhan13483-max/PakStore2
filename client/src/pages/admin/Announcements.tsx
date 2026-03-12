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
  announcementDisplayModeEnum,
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
  DialogDescription,
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
import {
  Plus, Pencil, Trash2, Loader2, Megaphone,
  PanelTop, RectangleEllipsis, Eye, ExternalLink, ArrowRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  info: "Info",
  promo: "Promo",
  warning: "Warning",
  success: "Success",
};

const TYPE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  info: "default",
  promo: "secondary",
  warning: "destructive",
  success: "outline",
};

const DISPLAY_MODE_LABELS: Record<string, string> = {
  banner: "Banner",
  popup: "Pop-up",
};

const BANNER_TYPE_STYLES: Record<string, string> = {
  info: "bg-primary text-primary-foreground",
  promo: "bg-amber-500 text-white",
  warning: "bg-destructive text-destructive-foreground",
  success: "bg-emerald-600 text-white",
};

const POPUP_TYPE_CONFIG: Record<string, {
  accent: string; iconBg: string; iconColor: string; label: string; actionClass: string;
}> = {
  info: {
    accent: "bg-primary", iconBg: "bg-primary/10", iconColor: "text-primary",
    label: "Announcement", actionClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  promo: {
    accent: "bg-amber-500", iconBg: "bg-amber-500/10", iconColor: "text-amber-600",
    label: "Special Offer", actionClass: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  warning: {
    accent: "bg-destructive", iconBg: "bg-destructive/10", iconColor: "text-destructive",
    label: "Important Notice", actionClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  },
  success: {
    accent: "bg-emerald-600", iconBg: "bg-emerald-600/10", iconColor: "text-emerald-600",
    label: "Good News", actionClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

const QUERY_KEY = ["/api/announcements"];
const ACTIVE_QUERY_KEY = ["/api/announcements", "active"];

// ─── Preview Components ───────────────────────────────────────────────────────

function BannerPreview({ announcement }: { announcement: Announcement }) {
  const colorClass = BANNER_TYPE_STYLES[announcement.type] ?? BANNER_TYPE_STYLES.info;
  const hasLink = !!announcement.link_url;
  const linkText = announcement.link_text || "Learn more";

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Live preview — how it appears at the top of your site
      </p>
      <div
        className={cn(
          "relative w-full rounded-lg py-2.5 px-4 text-center text-sm font-medium",
          colorClass
        )}
      >
        <div className="flex items-center justify-center gap-2 pr-6">
          <span>{announcement.message}</span>
          {hasLink && (
            <span className="underline underline-offset-2 font-semibold opacity-90 whitespace-nowrap">
              {linkText} →
            </span>
          )}
        </div>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70">
          <X className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

function PopupPreview({ announcement }: { announcement: Announcement }) {
  const cfg = POPUP_TYPE_CONFIG[announcement.type] ?? POPUP_TYPE_CONFIG.info;
  const hasLink = !!announcement.link_url;
  const linkText = announcement.link_text || "Learn more";

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Live preview — how it appears as a pop-up on your site
      </p>
      <div className="border-2 border-border rounded-2xl overflow-hidden shadow-lg max-w-sm mx-auto">
        <div className={cn("h-1.5 w-full", cfg.accent)} />
        <div className="flex items-start justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", cfg.iconBg)}>
              <Megaphone className={cn("h-4 w-4", cfg.iconColor)} />
            </span>
            <span className={cn("text-sm font-semibold", cfg.iconColor)}>
              {cfg.label}
            </span>
          </div>
          <span className="p-1.5 rounded-full text-muted-foreground">
            <X className="h-4 w-4" />
          </span>
        </div>
        <div className="px-5 pb-3">
          <p className="text-sm leading-relaxed text-foreground">{announcement.message}</p>
        </div>
        <div className={cn(
          "flex items-center px-5 py-3 border-t gap-3",
          hasLink ? "justify-between" : "justify-end"
        )}>
          {hasLink && (
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              cfg.actionClass
            )}>
              {linkText}
              <ArrowRight className="h-3 w-3" />
            </span>
          )}
          <span className="text-xs text-muted-foreground px-2 py-1.5 rounded hover:bg-muted cursor-default">
            Dismiss
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewDialog({
  announcement,
  open,
  onClose,
}: {
  announcement: Announcement | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!announcement) return null;
  const isPopup = announcement.display_mode === "popup";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            Preview — {isPopup ? "Pop-up" : "Banner"}
          </DialogTitle>
          <DialogDescription>
            This is exactly how the announcement will appear to your visitors.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          {isPopup
            ? <PopupPreview announcement={announcement} />
            : <BannerPreview announcement={announcement} />
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Announcement Form ────────────────────────────────────────────────────────

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
            name="display_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display As</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="select-announcement-display-mode">
                      <SelectValue placeholder="Select display mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="banner">
                      <div className="flex items-center gap-2">
                        <PanelTop className="h-4 w-4" />
                        Banner (top bar)
                      </div>
                    </SelectItem>
                    <SelectItem value="popup">
                      <div className="flex items-center gap-2">
                        <RectangleEllipsis className="h-4 w-4" />
                        Pop-up (modal dialog)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  data-testid="input-announcement-order"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  onChange={(e) => field.onChange(e.target.value || null)}
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
                  onChange={(e) => field.onChange(e.target.value || null)}
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
          ) : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Announcement | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => announcementService.getAnnouncements(),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ACTIVE_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertAnnouncement) => announcementService.createAnnouncement(data),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Created", description: "Announcement created successfully." });
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) =>
      announcementService.updateAnnouncement(id, data),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Updated", description: "Announcement updated successfully." });
      setEditTarget(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Deleted", description: "Announcement deleted." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete.", variant: "destructive" });
    },
  });

  const createDefaults: AnnouncementFormData = {
    message: "",
    type: "info",
    display_mode: "banner",
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage banners and pop-ups shown to your visitors
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-announcement">
          <Plus className="mr-2 h-4 w-4" />
          Add Announcement
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total", value: announcements?.length ?? 0, color: "text-foreground" },
          { label: "Active", value: announcements?.filter((a) => a.is_active).length ?? 0, color: "text-emerald-600" },
          { label: "Inactive", value: announcements?.filter((a) => !a.is_active).length ?? 0, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="border rounded-xl bg-card p-4 flex items-center gap-4">
            <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Announcements</h2>
          <p className="text-xs text-muted-foreground">
            Click <Eye className="inline h-3 w-3 mx-0.5" /> to preview how it looks on site
          </p>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[35%]">Message</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Display</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!announcements || announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
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
                    <p className="text-sm leading-snug line-clamp-2">{announcement.message}</p>
                    {announcement.link_url && (
                      <a
                        href={announcement.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline mt-1 block truncate"
                        data-testid={`link-announcement-${announcement.id}`}
                      >
                        <ExternalLink className="inline h-3 w-3 mr-1" />
                        {announcement.link_text || announcement.link_url}
                      </a>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={TYPE_BADGE_VARIANTS[announcement.type] ?? "default"}>
                      {TYPE_LABELS[announcement.type] ?? announcement.type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {announcement.display_mode === "popup"
                        ? <RectangleEllipsis className="h-4 w-4" />
                        : <PanelTop className="h-4 w-4" />
                      }
                      <span>{DISPLAY_MODE_LABELS[announcement.display_mode ?? "banner"]}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={announcement.is_active}
                        onCheckedChange={(checked) =>
                          updateMutation.mutate({ id: announcement.id, data: { is_active: checked } })
                        }
                        data-testid={`switch-active-${announcement.id}`}
                      />
                      <Badge variant={announcement.is_active ? "default" : "secondary"}>
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
                          updateMutation.mutate({ id: announcement.id, data: { display_order: val } });
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
                        onClick={() => setPreviewTarget(announcement)}
                        title="Preview"
                        data-testid={`button-preview-${announcement.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                          if (confirm("Are you sure you want to delete this announcement?")) {
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
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <AnnouncementForm
              defaultValues={{
                message: editTarget.message,
                type: editTarget.type,
                display_mode: editTarget.display_mode ?? "banner",
                is_active: editTarget.is_active,
                display_order: editTarget.display_order,
                link_url: editTarget.link_url ?? null,
                link_text: editTarget.link_text ?? null,
              }}
              onSubmit={(data) => updateMutation.mutate({ id: editTarget.id, data })}
              isPending={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <PreviewDialog
        announcement={previewTarget}
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
      />
    </div>
  );
}
