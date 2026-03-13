import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  TrendingUp,
  AlertCircle,
  Search,
  BarChart3,
  Clock,
  Percent,
  Tag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getAllAnalyticsEntries,
  getAnalyticsSummary,
} from "@/services/searchAnalyticsService";
import type { Timestamp } from "firebase/firestore";

function formatTimestamp(ts: Timestamp | null): string {
  if (!ts || !ts.toDate) return "—";
  return ts.toDate().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 flex items-start gap-4 shadow-sm">
      <div className={cn("p-2.5 rounded-xl bg-primary/8 shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-black text-foreground truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function SearchAnalytics() {
  const [activeTab, setActiveTab] = useState<"all" | "zero">("all");

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin-search-analytics-summary"],
    queryFn: getAnalyticsSummary,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["admin-search-analytics-entries"],
    queryFn: getAllAnalyticsEntries,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });

  const allEntries = useMemo(
    () => [...entries].sort((a, b) => b.count - a.count),
    [entries]
  );

  const zeroEntries = useMemo(
    () => allEntries.filter((e) => !e.hasResults).sort((a, b) => b.count - a.count),
    [allEntries]
  );

  const displayEntries = activeTab === "zero" ? zeroEntries : allEntries;

  return (
    <>
      <Helmet>
        <title>Search Analytics — PakCart Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Search Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Understand what customers are searching for on PakCart
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Search}
              label="Total Unique Searches"
              value={summary?.totalUnique ?? 0}
              color="text-primary"
            />
            <StatCard
              icon={Clock}
              label="Searches Today"
              value={summary?.todayCount ?? 0}
              color="text-blue-600"
            />
            <StatCard
              icon={Percent}
              label="Zero-Result Rate"
              value={`${(summary?.zeroResultRate ?? 0).toFixed(1)}%`}
              sub="of searches return nothing"
              color={
                (summary?.zeroResultRate ?? 0) > 30
                  ? "text-red-500"
                  : "text-emerald-600"
              }
            />
            <StatCard
              icon={AlertCircle}
              label="Missing Products"
              value={zeroEntries.length}
              sub="searches with no results"
              color="text-orange-500"
            />
          </div>
        )}

        {/* Trending Tags */}
        {summary?.topTrending && summary.topTrending.length > 0 && (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Top 5 Trending Searches (last 7 days)
            </p>
            <div className="flex flex-wrap gap-2">
              {summary.topTrending.map((t) => (
                <Badge
                  key={t.query}
                  variant="secondary"
                  className="text-sm font-medium px-3 py-1"
                  data-testid={`trending-tag-${t.query}`}
                >
                  <Tag className="w-3 h-3 mr-1.5 text-primary" />
                  {t.query}
                  <span className="ml-1.5 text-muted-foreground font-normal">
                    ×{t.count}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "all"
                ? "bg-white dark:bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid="tab-all-searches"
          >
            All Searches
            <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {allEntries.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("zero")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "zero"
                ? "bg-white dark:bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid="tab-zero-results"
          >
            Zero-Result Searches
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              {zeroEntries.length}
            </span>
          </button>
        </div>

        {activeTab === "zero" && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              These are search terms customers use but find no results for. Consider
              adding products or improving your search index for high-demand terms.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {entriesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : displayEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {activeTab === "zero"
                    ? "No zero-result searches recorded yet."
                    : "No search data recorded yet."}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-muted/30">
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Query
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-28">
                      Searches
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">
                      Has Results
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-44">
                      Last Searched
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayEntries.map((entry, idx) => (
                    <tr
                      key={`${entry.query}-${idx}`}
                      className="border-b border-gray-50 dark:border-border/50 hover:bg-gray-50/50 dark:hover:bg-muted/20 transition-colors"
                      data-testid={`analytics-row-${idx}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                          <span className="truncate max-w-xs">{entry.query}</span>
                          {!entry.hasResults && entry.count > 5 && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                              data-testid={`high-demand-badge-${entry.query}`}
                            >
                              High Demand
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-foreground">
                          {entry.count.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.hasResults ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-0"
                          >
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-0"
                          >
                            No
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(entry.lastSearched)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
