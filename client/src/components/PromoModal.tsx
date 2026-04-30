import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Globe,
  ShieldCheck,
  Phone,
  Package,
  TrendingUp,
  Truck,
} from "lucide-react";

const STORAGE_KEY = "pakcart_promo_modal_seen";
const DELAY_MS = 20_000;

export default function PromoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-md sm:max-w-lg p-0 overflow-hidden gap-0 border-t-4 border-t-orange-400"
        data-testid="modal-promo"
      >
        <div className="bg-orange-50 px-6 pt-8 pb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Rocket className="h-6 w-6 text-orange-500" />
          </div>
          <DialogHeader>
            <DialogTitle
              className="text-xl font-bold text-gray-900"
              data-testid="text-promo-title"
            >
              Apna Online Store Chahiye?
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-600">
              Professional e-commerce websites — pehle din se sell karne ke liye tayyar.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <FeatureCard icon={<Globe className="h-5 w-5 text-orange-500" />} label="Apni Website" />
            <FeatureCard icon={<ShieldCheck className="h-5 w-5 text-orange-500" />} label="Fully Managed" />
            <FeatureCard icon={<Phone className="h-5 w-5 text-orange-500" />} label="Full Support" />
          </div>

          <Link href="/web-development">
            <Button
              onClick={close}
              className="mt-5 w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
              data-testid="button-promo-learn-more"
            >
              Learn more →
            </Button>
          </Link>
        </div>

        <div className="px-6 py-5 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-bold tracking-wider text-orange-500">
              DROPSHIPPER PROGRAM
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-sm text-gray-700 mb-4">
            <span className="font-bold text-gray-900">PakCart Dropshipper Program</span> — ghar baithay business shuru karein, koi investment nahi.
          </p>

          <div className="space-y-2 mb-5">
            <BulletRow icon={<Package className="h-4 w-4 text-orange-500" />} label="Zero Stock, Zero Tension" />
            <BulletRow icon={<TrendingUp className="h-4 w-4 text-orange-500" />} label="Apna Profit Set Karein" />
            <BulletRow icon={<Truck className="h-4 w-4 text-orange-500" />} label="Delivery Hamari Zimmedari" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/dropshipper">
              <Button
                onClick={close}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
                data-testid="button-promo-join"
              >
                Abhi Join Karein
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={close}
              className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              data-testid="button-promo-dismiss"
            >
              Baad Mein
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-3">
      {icon}
      <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
    </div>
  );
}

function BulletRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 bg-gray-50/60">
      {icon}
      <span className="text-sm text-gray-800">{label}</span>
    </div>
  );
}
