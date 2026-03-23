import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementService } from "@/services/announcementService";
import { type Announcement } from "@shared/announcement-schema";
import { X, ExternalLink } from "lucide-react";
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
  enter: (dir: number) => ({ y: dir > 0 ? 16 : -16, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -16 : 16, opacity: 0 }),
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
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      data-testid="announcement-banner"
    >
      {/* Main row */}
      <div className="relative flex items-center min-h-[2.25rem]">
        {/* Slide content */}
        <div className="flex-1 overflow-hidden px-8 py-1.5 sm:py-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={announcement?.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 text-center w-full"
              data-testid={`announcement-bar-${announcement?.id}`}
            >
              <span
                className="text-[11px] sm:text-sm font-medium leading-snug"
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
                    className="inline-flex items-center gap-1 underline underline-offset-2 opacity-90 hover:opacity-100 font-semibold text-[11px] sm:text-sm"
                    data-testid={`announcement-link-${announcement.id}`}
                  >
                    {linkText}
                    <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                  </a>
                ) : (
                  <Link href={announcement.link_url!}>
                    <a
                      className="inline-flex items-center gap-1 underline underline-offset-2 opacity-90 hover:opacity-100 font-semibold text-[11px] sm:text-sm"
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

        {/* Dismiss button — large touch target on mobile */}
        <button
          type="button"
          onClick={() => handleDismiss(announcement?.id)}
          className="absolute right-0 top-0 h-full w-8 flex items-center justify-center z-10 opacity-60 hover:opacity-100 active:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Dismiss announcement"
          data-testid={`announcement-dismiss-${announcement?.id}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dot indicators */}
      {showMultiple && (
        <div className="flex justify-center gap-1.5 pb-1.5">
          {visible.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > currentIndex ? 1 : -1)}
              className={cn(
                "rounded-full transition-all duration-300 focus-visible:outline-none",
                "touch-manipulation",
                idx === currentIndex
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70 active:bg-white/90"
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
