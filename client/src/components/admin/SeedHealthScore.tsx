import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import type { HealthScore } from "@/lib/seed-data/analytics";

interface Props {
  score: HealthScore;
}

const BREAKDOWN_LABELS: Record<keyof HealthScore["breakdown"], { label: string; max: number }> = {
  ratingDistribution: { label: "Rating distribution", max: 20 },
  dateSpread: { label: "Comment date spread", max: 20 },
  noDuplicates: { label: "No duplicate content", max: 20 },
  nameDiversity: { label: "Name diversity", max: 15 },
  lengthVariety: { label: "Review length variety", max: 15 },
  avatarDiversity: { label: "Avatar diversity", max: 10 },
};

function scoreColor(total: number) {
  if (total >= 80) return "text-green-600 dark:text-green-400";
  if (total >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBg(total: number) {
  if (total >= 80) return "bg-green-500";
  if (total >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function scoreLabel(total: number) {
  if (total >= 80) return "Excellent";
  if (total >= 60) return "Good";
  if (total >= 40) return "Fair";
  return "Poor";
}

export function SeedHealthScore({ score }: Props) {
  return (
    <div className="space-y-4">
      {/* Big score display */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className={cn(
              "text-5xl font-bold tabular-nums",
              scoreColor(score.total)
            )}
            data-testid="health-score-value"
          >
            {score.total}
          </div>
          <div className="text-xs text-muted-foreground text-right">/ 100</div>
        </div>
        <div>
          <div
            className={cn("text-sm font-semibold", scoreColor(score.total))}
          >
            {scoreLabel(score.total)}
          </div>
          <div className="text-xs text-muted-foreground max-w-[180px] leading-relaxed">
            Comment realism score based on 6 quality factors
          </div>
        </div>
        <ShieldCheck
          className={cn(
            "h-10 w-10 ml-auto opacity-80",
            scoreColor(score.total)
          )}
        />
      </div>

      {/* Overall bar */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", scoreBg(score.total))}
          style={{ width: `${score.total}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5 pt-1">
        {(Object.entries(score.breakdown) as [keyof HealthScore["breakdown"], number][]).map(
          ([key, val]) => {
            const { label, max } = BREAKDOWN_LABELS[key];
            const pct = max > 0 ? Math.round((val / max) * 100) : 0;
            return (
              <div key={key} className="space-y-0.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{label}</span>
                  <span className="tabular-nums font-medium text-foreground">
                    {val} / {max}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      pct >= 80
                        ? "bg-green-500"
                        : pct >= 50
                        ? "bg-amber-500"
                        : "bg-red-400"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
