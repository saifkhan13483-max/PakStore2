import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementService } from "@/services/announcementService";
import { type Announcement } from "@shared/announcement-schema";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const DISMISSED_POPUP_KEY = "pakcart_dismissed_popups";

function getDismissedPopups(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_POPUP_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissedPopup(id: string): void {
  try {
    const current = getDismissedPopups();
    sessionStorage.setItem(DISMISSED_POPUP_KEY, JSON.stringify([...current, id]));
  } catch {
    // silently ignore
  }
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  info: {
    bg: "bg-primary/10 dark:bg-primary/20",
    text: "text-primary",
    border: "border-primary/30",
    badge: "bg-primary text-primary-foreground",
  },
  promo: {
    bg: "bg-secondary/10 dark:bg-secondary/20",
    text: "text-secondary-foreground",
    border: "border-secondary/30",
    badge: "bg-secondary text-secondary-foreground",
  },
  warning: {
    bg: "bg-destructive/10 dark:bg-destructive/20",
    text: "text-destructive",
    border: "border-destructive/30",
    badge: "bg-destructive text-destructive-foreground",
  },
  success: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    badge: "bg-emerald-600 text-white",
  },
};

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default function AnnouncementPopup() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Announcement | null>(null);
  const [queue, setQueue] = useState<Announcement[]>([]);

  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements", "active"],
    queryFn: () => announcementService.getActiveAnnouncements(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!announcements) return;
    const dismissed = getDismissedPopups();
    const pending = announcements.filter(
      (a) => a.display_mode === "popup" && !dismissed.includes(a.id)
    );
    if (pending.length === 0) return;
    setQueue(pending.slice(1));
    setCurrent(pending[0]);
    setOpen(true);
  }, [announcements]);

  function handleDismiss() {
    if (!current) return;
    addDismissedPopup(current.id);
    if (queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
    } else {
      setOpen(false);
      setCurrent(null);
    }
  }

  if (!current) return null;

  const styles = TYPE_STYLES[current.type] ?? TYPE_STYLES.info;
  const hasLink = !!current.link_url;
  const linkText = current.link_text || "Learn more";
  const isExternal = hasLink && isExternalUrl(current.link_url!);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDismiss(); }}>
      <DialogContent
        className={cn(
          "max-w-md rounded-2xl border-2 p-0 overflow-hidden",
          styles.border
        )}
        data-testid={`announcement-popup-${current.id}`}
      >
        <DialogTitle className="sr-only">Announcement</DialogTitle>

        <div className={cn("px-6 pt-6 pb-2 flex items-center gap-3", styles.bg)}>
          <span className={cn("inline-flex items-center justify-center rounded-full p-2", styles.badge)}>
            <Megaphone className="h-4 w-4" />
          </span>
          <span className={cn("text-xs font-semibold uppercase tracking-wider", styles.text)}>
            {current.type}
          </span>
        </div>

        <div className="px-6 py-5">
          <p
            className="text-base leading-relaxed text-foreground"
            data-testid={`popup-message-${current.id}`}
          >
            {current.message}
          </p>

          {hasLink && (
            <div className="mt-4">
              {isExternal ? (
                <a
                  href={current.link_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4",
                    styles.text
                  )}
                  data-testid={`popup-link-${current.id}`}
                >
                  {linkText}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link href={current.link_url!}>
                  <a
                    onClick={handleDismiss}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4",
                      styles.text
                    )}
                    data-testid={`popup-link-${current.id}`}
                  >
                    {linkText}
                  </a>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="gap-2"
            data-testid={`popup-dismiss-${current.id}`}
          >
            <X className="h-3.5 w-3.5" />
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
