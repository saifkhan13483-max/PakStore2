import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import type { AnalyticsData, RatingDist } from "@/lib/seed-data/analytics";
import { Star } from "lucide-react";

interface Props {
  data: AnalyticsData;
}

const STAR_COLORS: Record<number, string> = {
  5: "#22c55e",
  4: "#84cc16",
  3: "#eab308",
  2: "#f97316",
  1: "#ef4444",
};

function RatingDistChart({ dist }: { dist: RatingDist }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  const data = [5, 4, 3, 2, 1].map((star) => ({
    star: `${star}★`,
    count: dist[star as keyof RatingDist],
    pct: Math.round((dist[star as keyof RatingDist] / total) * 100),
    fill: STAR_COLORS[star],
  }));

  return (
    <div className="space-y-2" data-testid="rating-dist-chart">
      {data.map((row) => (
        <div key={row.star} className="flex items-center gap-2 text-xs">
          <span className="w-6 text-right shrink-0 text-muted-foreground font-medium">
            {row.star}
          </span>
          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${row.pct}%`, backgroundColor: row.fill }}
            />
          </div>
          <span className="w-16 text-right tabular-nums text-muted-foreground shrink-0">
            {row.count} ({row.pct}%)
          </span>
        </div>
      ))}
    </div>
  );
}

function SeededVsRealDonut({
  seeded,
  real,
}: {
  seeded: number;
  real: number;
}) {
  const total = seeded + real || 1;
  const seededPct = Math.round((seeded / total) * 100);
  const realPct = 100 - seededPct;
  const pieData = [
    { name: "Seeded", value: seeded, fill: "hsl(var(--primary))" },
    { name: "Real", value: real, fill: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="flex flex-col items-center gap-3" data-testid="seeded-vs-real-chart">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={56}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-primary">
            {seededPct}%
          </span>
          <span className="text-[10px] text-muted-foreground">seeded</span>
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          Seeded ({seeded})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" />
          Real ({real})
        </span>
      </div>
    </div>
  );
}

function CommentsOverTimeChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <div className="w-full h-32" data-testid="comments-over-time-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            interval={14}
          />
          <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            labelFormatter={(v) => new Date(String(v)).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
            formatter={(val: number) => [val, "Comments"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeedAnalytics({ data }: Props) {
  return (
    <div className="space-y-6" data-testid="seed-analytics">
      {/* Top row: Seeded vs Real + Rating dist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seeded vs Real */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Seeded vs Real Comments
          </h4>
          <SeededVsRealDonut seeded={data.totalSeeded} real={data.totalReal} />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="text-center p-2 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground">Seeded avg rating</div>
              <div className="text-lg font-bold text-primary tabular-nums">
                {data.seededAvgRating.toFixed(1)}
                <Star className="inline h-3 w-3 fill-amber-400 text-amber-400 ml-0.5 -mt-0.5" />
              </div>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground">Real avg rating</div>
              <div className="text-lg font-bold tabular-nums">
                {data.realAvgRating > 0 ? data.realAvgRating.toFixed(1) : "—"}
                {data.realAvgRating > 0 && (
                  <Star className="inline h-3 w-3 fill-amber-400 text-amber-400 ml-0.5 -mt-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Seeded Rating Distribution
          </h4>
          <RatingDistChart dist={data.seededRatingDist} />
        </div>
      </div>

      {/* Comments over time */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Seeded Comments — Last 90 Days
        </h4>
        <CommentsOverTimeChart data={data.commentsOverTime} />
      </div>

      {/* Products only seeded / zero comments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="text-sm font-medium">
            Only Seeded Comments
            <span
              className={cn(
                "ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full",
                data.productsWithOnlySeeded.length > 0
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}
              data-testid="only-seeded-count"
            >
              {data.productsWithOnlySeeded.length} products
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Products with seeded reviews but no real customer comments yet.
          </p>
          {data.productsWithOnlySeeded.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-0.5 max-h-24 overflow-y-auto custom-scrollbar">
              {data.productsWithOnlySeeded.slice(0, 8).map((p) => (
                <li key={p.productId} className="truncate">
                  • {p.productName}
                </li>
              ))}
              {data.productsWithOnlySeeded.length > 8 && (
                <li className="text-muted-foreground/60">
                  …and {data.productsWithOnlySeeded.length - 8} more
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <div className="text-sm font-medium">
            No Comments At All
            <span
              className={cn(
                "ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full",
                data.productsWithNoComments.length > 0
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}
              data-testid="no-comments-count"
            >
              {data.productsWithNoComments.length} products
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Products with zero reviews — neither real nor seeded.
          </p>
          {data.productsWithNoComments.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-0.5 max-h-24 overflow-y-auto custom-scrollbar">
              {data.productsWithNoComments.slice(0, 8).map((p) => (
                <li key={p.id} className="truncate">
                  • {p.name}
                </li>
              ))}
              {data.productsWithNoComments.length > 8 && (
                <li className="text-muted-foreground/60">
                  …and {data.productsWithNoComments.length - 8} more
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
