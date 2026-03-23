import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementService } from "@/services/announcementService";
import { type Announcement } from "@shared/announcement-schema";
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";

const DISMISSED_KEY = "pakcart_dismissed_announcements";
const SLIDE_INTERVAL = 4000;

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
  } catch {}
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

const slideVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 20 : -20, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -20 : 20, opacity: 0 }),
};

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState<string[]>(() => getDismissed());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements", "active"],
    queryFn: () => announcementService.getActiveAnnouncements(),
    staleTime: 5 * 60 * 1000,
  });

  const visible = (announcements ?? []).filter(
    (a) => !dismissed.includes(a.id) && (a.display_mode === "banner" || !a.display_mode)
  );

  const goTo = useCallback((idx: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrentIndex(idx);
  }, []);

  const goNext = useCallback(() => {
    if (visible.length <= 1) return;
    goTo((currentIndex + 1) % visible.length, 1);
  }, [visible.length, currentIndex, goTo]);

  const goPrev = useCallback(() => {
    if (visible.length <= 1) return;
    goTo((currentIndex - 1 + visible.length) % visible.length, -1);
  }, [visible.length, currentIndex, goTo]);

  useEffect(() => {
    if (visible.length <= 1 || isPaused) return;
    const timer = setInterval(goNext, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [visible.length, isPaused, goNext]);

  useEffect(() => {
    if (visible.length > 0 && currentIndex >= visible.length) {
      setCurrentIndex(visible.length - 1);
    }
  }, [visible.length, currentIndex]);

  if (visible.length === 0) return null;

  const announcement = visible[currentIndex];
  const colorClass = TYPE_STYLES[announcement?.type] ?? TYPE_STYLES.info;
  const hasLink = !!announcement?.link_url;
  const linkText = announcement?.link_text || "Learn more";
  const isExternal = hasLink && isExternalUrl(announcement.link_url!);
  const showMultiple = visible.length > 1;

  function handleDismiss(id: string) {
    addDismissed(id);
    setDismissed((prev) => [...prev, id]);
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden transition-colors duration-500",
        colorClass
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="announcement-banner"
    >
      <div className="relative flex items-center" style={{ minHeight: "2.25rem" }}>
        {showMultiple && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 z-10 p-1 opacity-50 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            aria-label="Previous announcement"
            data-testid="announcement-prev"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        )}

        <div className="flex-1 overflow-hidden px-8 py-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={announcement?.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 text-sm font-medium text-center"
              data-testid={`announcement-bar-${announcement?.id}`}
            >
              <span
                className="leading-snug"
                data-testid={`announcement-message-${announcement?.id}`}
              >
                {announcement?.message}
              </span>

              {hasLink && (
                isExternal ? (
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
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {showMultiple && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-8 z-10 p-1 opacity-50 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            aria-label="Next announcement"
            data-testid="announcement-next"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}

        <button
          type="button"
          onClick={() => handleDismiss(announcement?.id)}
          className="absolute right-2 z-10 p-0.5 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
          aria-label="Dismiss announcement"
          data-testid={`announcement-dismiss-${announcement?.id}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {showMultiple && (
        <div className="flex justify-center gap-1 pb-1">
          {visible.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > currentIndex ? 1 : -1)}
              className={cn(
                "rounded-full transition-all duration-300 focus-visible:outline-none",
                idx === currentIndex
                  ? "w-4 h-1 bg-white"
                  : "w-1 h-1 bg-white/40 hover:bg-white/70"
              )}
              aria-label={`Go to announcement ${idx + 1}`}
              data-testid={`announcement-dot-${idx}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
