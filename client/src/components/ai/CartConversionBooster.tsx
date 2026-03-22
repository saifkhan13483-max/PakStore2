import { useEffect } from "react";
import { Zap, Tag, ShieldCheck, Loader2 } from "lucide-react";
import { useAICartConversion } from "@/hooks/use-ai";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface CartConversionBoosterProps {
  items: CartItem[];
  total: number;
}

export function CartConversionBooster({ items, total }: CartConversionBoosterProps) {
  const { generate, isLoading, messages } = useAICartConversion();

  useEffect(() => {
    if (items.length > 0) {
      generate(items, total);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!messages) return null;

  return (
    <div className="mt-4 space-y-2" data-testid="ai-conversion-booster">
      <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-lg px-3 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-orange-700 dark:text-orange-400 leading-relaxed font-medium" data-testid="ai-urgency-message">
          {messages.urgency}
        </p>
      </div>
      <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg px-3 py-2">
        <Tag className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-green-700 dark:text-green-400 leading-relaxed" data-testid="ai-offer-message">
          {messages.offer}
        </p>
      </div>
      <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg px-3 py-2">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed" data-testid="ai-trust-message">
          {messages.trust}
        </p>
      </div>
    </div>
  );
}
