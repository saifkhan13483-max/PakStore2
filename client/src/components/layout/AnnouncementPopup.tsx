import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementService } from "@/services/announcementService";
import { type Announcement } from "@shared/announcement-schema";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Megaphone, ArrowRight, X } from "lucide-react";
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

function markDismissed(id: string): void {
  try {
    const current = getDismissedPopups();
    if (!current.includes(id)) {
      sessionStorage.setItem(DISMISSED_POPUP_KEY, JSON.stringify([...current, id]));
    }
  } catch {
    // ignore
  }
}

const TYPE_CONFIG: Record<
  string,
  { accent: string; iconBg: string; iconColor: string; label: string; actionClass: string }
> = {
  info: {
    accent: "bg-primary",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    label: "Announcement",
    actionClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  promo: {
    accent: "bg-amber-500",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Special Offer",
    actionClass: "bg-amber-500 hover:bg-amber-500/90 text-white",
  },
  warning: {
    accent: "bg-destructive",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    label: "Important Notice",
    actionClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  },
  success: {
    accent: "bg-emerald-600",
    iconBg: "bg-emerald-600/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "Good News",
    actionClass: "bg-emerald-600 hover:bg-emerald-600/90 text-white",
  },
};

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export default function AnnouncementPopup() {
  const initialized = useRef(false);
  const [queue, setQueue] = useState<Announcement[]>([]);
  const [current, setCurrent] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements", "active"],
    queryFn: () => announcementService.getActiveAnnouncements(),
    staleTime: 5 * 60 * 1000,
  });

  // Only initialise once — ignore re-fetches so dismissed popups don't reappear
  useEffect(() => {
    if (initialized.current || !announcements) return;
    initialized.current = true;

    const dismissed = getDismissedPopups();
    const pending = announcements.filter(
      (a) => a.display_mode === "popup" && !dismissed.includes(a.id)
    );
    if (pending.length === 0) return;

    setCurrent(pending[0]);
    setQueue(pending.slice(1));
    // Small delay so the page renders first before the popup appears
    setTimeout(() => setOpen(true), 600);
  }, [announcements]);

  function advance() {
    if (!current) return;
    markDismissed(current.id);
    if (queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
      // keep dialog open for next item
    } else {
      setOpen(false);
      setTimeout(() => setCurrent(null), 300);
    }
  }

  if (!current) return null;

  const cfg = TYPE_CONFIG[current.type] ?? TYPE_CONFIG.info;
  const hasLink = !!current.link_url;
  const linkText = current.link_text || "Learn more";
  const isExternal = hasLink && isExternalUrl(current.link_url!);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) advance();
      }}
    >
      {/* Hide the built-in X via DialogContent override below */}
      <DialogContent
        className="max-w-sm w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden gap-0 [&>button]:hidden"
        data-testid={`announcement-popup-${current.id}`}
      >
        {/* Required for accessibility */}
        <DialogTitle className="sr-only">{cfg.label}</DialogTitle>
        <DialogDescription className="sr-only">{current.message}</DialogDescription>

        {/* Accent top bar */}
        <div className={cn("h-1.5 w-full", cfg.accent)} />

        {/* Header row */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                cfg.iconBg
              )}
            >
              <Megaphone className={cn("h-4 w-4", cfg.iconColor)} />
            </span>
            <span className={cn("text-sm font-semibold", cfg.iconColor)}>
              {cfg.label}
            </span>
          </div>

          {/* Custom close button */}
          <button
            type="button"
            onClick={advance}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss"
            data-testid={`popup-close-${current.id}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <p
            className="text-sm leading-relaxed text-foreground"
            data-testid={`popup-message-${current.id}`}
          >
            {current.message}
          </p>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "flex items-center px-5 py-4 border-t gap-3",
            hasLink ? "justify-between" : "justify-end"
          )}
        >
          {hasLink && (
            isExternal ? (
              <a
                href={current.link_url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={advance}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  cfg.actionClass
                )}
                data-testid={`popup-link-${current.id}`}
              >
                {linkText}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <Link href={current.link_url!}>
                <a
                  onClick={advance}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    cfg.actionClass
                  )}
                  data-testid={`popup-link-${current.id}`}
                >
                  {linkText}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Link>
            )
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={advance}
            className="text-muted-foreground hover:text-foreground"
            data-testid={`popup-dismiss-${current.id}`}
          >
            Dismiss
          </Button>
        </div>

        {/* Queue indicator */}
        {queue.length > 0 && (
          <div className="flex justify-center gap-1.5 pb-4">
            <span className={cn("h-1.5 w-4 rounded-full", cfg.accent)} />
            {queue.map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
