import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Wrench,
  RefreshCw,
  XCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  runAudit,
  autoFixIssues,
  fetchSeededForAudit,
  type AuditReport,
  type AuditIssue,
} from "@/lib/seed-data/audit";

const ISSUE_TYPE_LABELS: Record<string, string> = {
  duplicate_content: "Duplicate Content",
  overused_name: "Overused Reviewer Name",
  future_timestamp: "Future Timestamp",
  missing_fields: "Missing Required Fields",
  rating_anomaly: "Rating Distribution Anomaly",
};

function IssueRow({ issue }: { issue: AuditIssue }) {
  const isError = issue.severity === "error";
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md p-3 border text-sm",
        isError
          ? "border-destructive/30 bg-destructive/5"
          : "border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/10"
      )}
      data-testid={`audit-issue-${issue.type}`}
    >
      <div className="mt-0.5 shrink-0">
        {isError ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">
            {ISSUE_TYPE_LABELS[issue.type] ?? issue.type}
          </span>
          <Badge
            variant={isError ? "destructive" : "outline"}
            className={cn(
              "text-[10px] px-1.5",
              !isError && "border-amber-400 text-amber-700 dark:text-amber-400"
            )}
          >
            {issue.severity}
          </Badge>
          {issue.fixable && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 border-green-400 text-green-700 dark:text-green-400"
            >
              auto-fixable
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {issue.description}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-xs tabular-nums font-medium text-muted-foreground">
          {issue.affectedCount} affected
        </span>
      </div>
    </div>
  );
}

export function CommentAudit() {
  const { toast } = useToast();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const seeded = await fetchSeededForAudit();
      const result = runAudit(seeded);
      setReport(result);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit failed", description: e.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleAutoFix = async () => {
    if (!report) return;
    setIsFixing(true);
    try {
      const fixable = report.issues.filter((i) => i.fixable);
      const result = await autoFixIssues(fixable);
      toast({
        title: "Auto-fix complete",
        description: `Fixed ${result.fixed} issue(s). ${result.details.slice(0, 2).join(" ")}`,
      });
      // Re-run audit to reflect fixes
      await handleRunAudit();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Auto-fix failed", description: e.message });
    } finally {
      setIsFixing(false);
    }
  };

  const fixableCount = report?.issues.filter((i) => i.fixable).length ?? 0;

  return (
    <div className="space-y-4" data-testid="comment-audit">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRunAudit}
          disabled={isRunning || isFixing}
          data-testid="button-run-audit"
        >
          {isRunning ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running Audit…</>
          ) : (
            <><RefreshCw className="h-4 w-4 mr-2" /> Run Audit</>
          )}
        </Button>
        {report && fixableCount > 0 && (
          <Button
            size="sm"
            variant="default"
            onClick={handleAutoFix}
            disabled={isFixing || isRunning}
            data-testid="button-auto-fix"
          >
            {isFixing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Fixing…</>
            ) : (
              <><Wrench className="h-4 w-4 mr-2" /> Auto-fix ({fixableCount})</>
            )}
          </Button>
        )}
        {report && (
          <span className="text-xs text-muted-foreground ml-auto">
            Last run: {report.runAt.toLocaleTimeString("en-PK")} — {report.totalChecked} comments checked
          </span>
        )}
      </div>

      {/* Results */}
      {report && (
        <div className="space-y-3">
          {report.issues.length === 0 ? (
            <div className="flex items-center gap-3 rounded-md border border-green-300/40 bg-green-50/50 dark:bg-green-950/10 p-4 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">No issues found</p>
                <p className="text-xs opacity-80 mt-0.5">
                  All {report.totalChecked} seeded comments passed the quality audit.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                {report.issues.length} issue{report.issues.length !== 1 ? "s" : ""} found across {report.totalChecked} seeded comments.
                {fixableCount > 0 && (
                  <span className="text-green-600 dark:text-green-400">
                    {fixableCount} can be auto-fixed.
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {report.issues.map((issue, idx) => (
                  <IssueRow key={idx} issue={issue} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!report && !isRunning && (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
          <AlertTriangle className="h-8 w-8 opacity-20" />
          <p className="text-sm">Click "Run Audit" to scan all seeded comments for quality issues</p>
        </div>
      )}
    </div>
  );
}
