import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Rocket, Globe, ShieldCheck, Phone, Package, Truck, TrendingUp } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
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
        className="max-w-lg w-[calc(100%-1.5rem)] rounded-2xl p-0 overflow-hidden gap-0 [&>button]:hidden"
        data-testid="advert-popup"
      >
        <DialogTitle className="sr-only">Announcement</DialogTitle>
        <DialogDescription className="sr-only">
          Apna Online Store banwain aur Dropshipper Program join karein
        </DialogDescription>

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-amber-500" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
          data-testid="advert-popup-close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto max-h-[85vh]">

          {/* ── SECTION 1: Online Store Advertisement ── */}
          <div className="bg-[#fffbf0] px-5 pt-6 pb-5">
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Rocket className="h-6 w-6 text-amber-500" />
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-center text-lg font-bold text-gray-800 leading-snug mb-1">
              Apna Khud Ka Online Store Chahiye?
            </h2>
            <p className="text-center text-sm text-gray-500 mb-4">
              Hum Pakistan mein businesses ke liye complete, professional e-commerce websites
              banate hain — pehle din se sell karne ke liye tayyar.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-white p-3 text-center shadow-sm">
                <Globe className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-semibold text-gray-700">Apni Website</span>
                <span className="text-[10px] text-gray-400 leading-tight">
                  Brand name, logo aur products ke saath
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-white p-3 text-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-semibold text-gray-700">Fully Managed</span>
                <span className="text-[10px] text-gray-400 leading-tight">
                  Design, setup — aap sirf sell karein
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-white p-3 text-center shadow-sm">
                <Phone className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-semibold text-gray-700">Full Support</span>
                <span className="text-[10px] text-gray-400 leading-tight">
                  Hum har qadam mein aapke saath hain
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mb-3">
              Shuru karna chahte hain? WhatsApp karein — koi technical knowledge zarori nahi.
            </p>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/923188055850"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 text-sm transition-colors"
              data-testid="advert-popup-whatsapp"
              onClick={handleClose}
            >
              <SiWhatsapp className="h-4 w-4" />
              WhatsApp Us — +92 318 8055850
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-5 py-3 bg-white">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
              Hamara Dropshipper Program
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── SECTION 2: Dropshipper Program ── */}
          <div className="bg-white px-5 pb-6">
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              <span className="font-semibold text-gray-800">PakCart Dropshipper Program</span> join
              karein aur ghar baithay apna business shuru karein — koi investment nahi, koi stock
              nahi!
            </p>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-start gap-3 rounded-xl border bg-gray-50 p-3">
                <Package className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Zero Stock, Zero Tension</p>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Aapko kuch khareedne ki zaroorat nahi. Hum stock sambhaltay hain, aap sirf
                    orders laen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border bg-gray-50 p-3">
                <TrendingUp className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Apna Profit Set Karein</p>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Har product pe aap khud apna profit margin choose karte hain — jitna chaahein
                    utna kamayein.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border bg-gray-50 p-3">
                <Truck className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Delivery Hamari Zimmedari</p>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Order aane ke baad packaging aur delivery ki poori zimmedari humari hoti hai.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => { handleClose(); navigate("/dropshipper"); }}
                className="flex-1 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 text-sm transition-colors text-center"
                data-testid="advert-popup-dropshipper-join"
              >
                Abhi Join Karein
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 font-medium py-2.5 text-sm transition-colors"
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
