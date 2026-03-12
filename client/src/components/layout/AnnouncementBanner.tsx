import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementService } from "@/services/announcementService";
import { type Announcement } from "@shared/announcement-schema";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const DISMISSED_KEY = "pakcart_dismissed_announcements";

function getDismissed(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissed(id: string): void {
  try {
    const current = getDismissed();
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
  } catch {
    // silently ignore
  }
}

const TYPE_STYLES: Record<string, string> = {
  info: "bg-primary text-primary-foreground",
  promo: "bg-secondary text-secondary-foreground",
  warning: "bg-destructive text-destructive-foreground",
  success: "bg-emerald-600 text-white dark:bg-emerald-700",
};

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function AnnouncementItem({
  announcement,
  onDismiss,
}: {
  announcement: Announcement;
  onDismiss: (id: string) => void;
}) {
  const colorClass = TYPE_STYLES[announcement.type] ?? TYPE_STYLES.info;
  const hasLink = !!announcement.link_url;
  const linkText = announcement.link_text || "Learn more";
  const isExternal = hasLink && isExternalUrl(announcement.link_url!);

  return (
    <div
      className={cn(
        "relative w-full py-2 px-4 text-center text-sm font-medium",
        colorClass
      )}
      role="region"
      aria-label="Site announcement"
      data-testid={`announcement-bar-${announcement.id}`}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-center gap-2 pr-8">
        <span className="leading-snug" data-testid={`announcement-message-${announcement.id}`}>
          {announcement.message}
        </span>

        {hasLink && (
          <>
            {isExternal ? (
              <a
                href={announcement.link_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-2 opacity-90 hover:opacity-100 whitespace-nowrap font-semibold"
                data-testid={`announcement-link-${announcement.id}`}
              >
                {linkText}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link href={announcement.link_url!}>
                <a
                  className="inline-flex items-center gap-1 underline underline-offset-2 opacity-90 hover:opacity-100 whitespace-nowrap font-semibold"
                  data-testid={`announcement-link-${announcement.id}`}
                >
                  {linkText}
                </a>
              </Link>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(announcement.id)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Dismiss announcement"
        data-testid={`announcement-dismiss-${announcement.id}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState<string[]>(() => getDismissed());

  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements", "active"],
    queryFn: () => announcementService.getActiveAnnouncements(),
    staleTime: 5 * 60 * 1000,
  });

  const visible = (announcements ?? []).filter(
    (a) => !dismissed.includes(a.id) && (a.display_mode === "banner" || !a.display_mode)
  );

  if (visible.length === 0) return null;

  function handleDismiss(id: string) {
    addDismissed(id);
    setDismissed((prev) => [...prev, id]);
  }

  return (
    <div data-testid="announcement-banner">
      {visible.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}
