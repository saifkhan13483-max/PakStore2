import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Rocket, Globe, ShieldCheck, Phone, Package, Truck, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

const SESSION_KEY = "pakcart_advert_popup_seen";

export default function AdvertPopup() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleClose() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="
          w-[calc(100%-1rem)] sm:max-w-lg
          max-h-[90svh] sm:max-h-[88svh]
          rounded-2xl p-0 overflow-hidden gap-0
          [&>button]:hidden
          flex flex-col
        "
        data-testid="advert-popup"
      >
        <DialogTitle className="sr-only">Announcement</DialogTitle>
        <DialogDescription className="sr-only">
          Apna Online Store banwain aur Dropshipper Program join karein
        </DialogDescription>

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-amber-500 shrink-0" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 rounded-full p-1.5 bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Close"
          data-testid="advert-popup-close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">

          {/* ── SECTION 1: Online Store Advertisement ── */}
          <div className="bg-[#fffbf0] px-4 sm:px-5 pt-5 sm:pt-6 pb-4 sm:pb-5">
            {/* Icon */}
            <div className="flex justify-center mb-2.5">
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-amber-100">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-center text-base sm:text-lg font-bold text-gray-800 leading-snug mb-1">
              Apna Khud Ka Online Store Chahiye?
            </h2>
            <p className="text-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 leading-relaxed px-1">
              Hum Pakistan mein businesses ke liye complete, professional e-commerce
              websites banate hain — pehle din se sell karne ke liye tayyar.
            </p>

            {/* Feature cards — 3 cols on all sizes, compact on mobile */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <div className="flex flex-col items-center gap-1 rounded-xl border bg-white px-1.5 py-2.5 sm:p-3 text-center shadow-sm">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700 leading-tight">Apni Website</span>
                <span className="hidden sm:block text-[10px] text-gray-400 leading-tight">
                  Brand name, logo aur products ke saath
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border bg-white px-1.5 py-2.5 sm:p-3 text-center shadow-sm">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700 leading-tight">Fully Managed</span>
                <span className="hidden sm:block text-[10px] text-gray-400 leading-tight">
                  Design, setup — aap sirf sell karein
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border bg-white px-1.5 py-2.5 sm:p-3 text-center shadow-sm">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700 leading-tight">Full Support</span>
                <span className="hidden sm:block text-[10px] text-gray-400 leading-tight">
                  Hum har qadam mein aapke saath hain
                </span>
              </div>
            </div>

            {/* Short sub-descriptions shown only on mobile below cards */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 sm:hidden">
              <p className="text-[9px] text-gray-400 text-center leading-tight">Brand name, logo aur products ke saath</p>
              <p className="text-[9px] text-gray-400 text-center leading-tight">Design aur setup — aap sirf sell karein</p>
              <p className="text-[9px] text-gray-400 text-center leading-tight">Har qadam mein aapke saath</p>
            </div>

            <button
              type="button"
              onClick={() => { handleClose(); navigate("/web-development"); }}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-amber-500 active:bg-amber-600 hover:bg-amber-600 text-white font-semibold py-2.5 text-xs sm:text-sm transition-colors"
              data-testid="advert-popup-web-development-link"
            >
              More details about our web development services →
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-white">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] sm:text-xs font-semibold text-amber-500 uppercase tracking-wide whitespace-nowrap">
              Hamara Dropshipper Program
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── SECTION 2: Dropshipper Program ── */}
          <div className="bg-white px-4 sm:px-5 pb-5 sm:pb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              <span className="font-semibold text-gray-800">PakCart Dropshipper Program</span> join
              karein aur ghar baithay apna business shuru karein — koi investment nahi, koi stock nahi!
            </p>

            <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
              <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl border bg-gray-50 p-2.5 sm:p-3">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-800">Zero Stock, Zero Tension</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug mt-0.5">
                    Aapko kuch khareedne ki zaroorat nahi. Hum stock sambhaltay hain, aap sirf orders laen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl border bg-gray-50 p-2.5 sm:p-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-800">Apna Profit Set Karein</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug mt-0.5">
                    Har product pe aap khud apna profit margin choose karte hain — jitna chaahein utna kamayein.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl border bg-gray-50 p-2.5 sm:p-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-800">Delivery Hamari Zimmedari</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug mt-0.5">
                    Order aane ke baad packaging aur delivery ki poori zimmedari humari hoti hai.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons — stacked on mobile, side by side on sm+ */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => { handleClose(); navigate("/dropshipper"); }}
                className="flex-1 flex items-center justify-center rounded-lg bg-amber-500 active:bg-amber-600 hover:bg-amber-600 text-white font-semibold py-3 sm:py-2.5 text-sm transition-colors"
                data-testid="advert-popup-dropshipper-join"
              >
                Abhi Join Karein
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-gray-200 active:bg-gray-100 hover:bg-gray-50 text-gray-500 font-medium py-3 sm:py-2.5 text-sm transition-colors"
                data-testid="advert-popup-dismiss"
              >
                Baad Mein
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
