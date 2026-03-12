/**
 * Comment quality audit — scans all seeded comments for issues and
 * optionally auto-fixes the ones that are resolvable client-side.
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import type { CommentDoc } from "./analytics";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditIssueType =
  | "duplicate_content"
  | "overused_name"
  | "future_timestamp"
  | "missing_fields"
  | "rating_anomaly";

export interface AuditIssue {
  type: AuditIssueType;
  severity: "warning" | "error";
  description: string;
  affectedCount: number;
  fixable: boolean;
  affectedIds: string[];
}

export interface AuditReport {
  totalChecked: number;
  issues: AuditIssue[];
  runAt: Date;
}

// ---------------------------------------------------------------------------
// Audit runner
// ---------------------------------------------------------------------------

/**
 * Scans the provided seeded comments and returns a full audit report.
 * Does NOT write anything to Firestore.
 */
export function runAudit(seededComments: CommentDoc[]): AuditReport {
  const issues: AuditIssue[] = [];
  const now = Date.now();

  // 1. Duplicate content: exact match within the same product
  const byProduct = new Map<string, Array<{ id: string; content: string }>>();
  for (const c of seededComments) {
    if (!byProduct.has(c.productId)) byProduct.set(c.productId, []);
    byProduct.get(c.productId)!.push({ id: c.id, content: c.content.trim().toLowerCase() });
  }
  const dupIds: string[] = [];
  for (const [, entries] of byProduct) {
    const seen = new Map<string, string>();
    for (const e of entries) {
      if (seen.has(e.content)) {
        dupIds.push(e.id);
      } else {
        seen.set(e.content, e.id);
      }
    }
  }
  if (dupIds.length > 0) {
    issues.push({
      type: "duplicate_content",
      severity: "warning",
      description: `${dupIds.length} comment(s) have identical content to another comment on the same product.`,
      affectedCount: dupIds.length,
      fixable: true,
      affectedIds: dupIds,
    });
  }

  // 2. Overused reviewer names (appears more than 3 times globally)
  const nameCounts = new Map<string, string[]>();
  for (const c of seededComments) {
    if (!nameCounts.has(c.userName)) nameCounts.set(c.userName, []);
    nameCounts.get(c.userName)!.push(c.id);
  }
  const overusedIds: string[] = [];
  const overusedNames: string[] = [];
  for (const [name, ids] of nameCounts) {
    if (ids.length > 3) {
      overusedNames.push(`${name} (${ids.length}×)`);
      overusedIds.push(...ids.slice(3));
    }
  }
  if (overusedIds.length > 0) {
    issues.push({
      type: "overused_name",
      severity: "warning",
      description: `${overusedNames.slice(0, 3).join(", ")}${overusedNames.length > 3 ? ` and ${overusedNames.length - 3} more` : ""} appear more than 3 times across all seeded comments.`,
      affectedCount: overusedIds.length,
      fixable: false,
      affectedIds: overusedIds,
    });
  }

  // 3. Future timestamps
  const futureIds = seededComments
    .filter((c) => c.createdAt?.seconds && c.createdAt.seconds * 1000 > now)
    .map((c) => c.id);
  if (futureIds.length > 0) {
    issues.push({
      type: "future_timestamp",
      severity: "error",
      description: `${futureIds.length} comment(s) have a createdAt timestamp that is in the future.`,
      affectedCount: futureIds.length,
      fixable: true,
      affectedIds: futureIds,
    });
  }

  // 4. Missing required fields
  const missingIds = seededComments
    .filter((c) => !c.content || !c.userName || !c.rating || !c.productId)
    .map((c) => c.id);
  if (missingIds.length > 0) {
    issues.push({
      type: "missing_fields",
      severity: "error",
      description: `${missingIds.length} comment(s) are missing one or more required fields (content, userName, rating, productId).`,
      affectedCount: missingIds.length,
      fixable: false,
      affectedIds: missingIds,
    });
  }

  // 5. Rating distribution anomaly
  if (seededComments.length >= 10) {
    const fiveStarPct =
      seededComments.filter((c) => Math.round(c.rating) === 5).length /
      seededComments.length;
    const lowStarPct =
      seededComments.filter((c) => Math.round(c.rating) <= 2).length /
      seededComments.length;
    if (fiveStarPct > 0.9) {
      issues.push({
        type: "rating_anomaly",
        severity: "warning",
        description: `${Math.round(fiveStarPct * 100)}% of seeded comments are 5-star, which looks unrealistically positive. Expected ~45%.`,
        affectedCount: Math.round(fiveStarPct * seededComments.length),
        fixable: false,
        affectedIds: [],
      });
    } else if (lowStarPct > 0.3) {
      issues.push({
        type: "rating_anomaly",
        severity: "warning",
        description: `${Math.round(lowStarPct * 100)}% of seeded comments are 1–2 star, which may look suspicious. Expected ~10%.`,
        affectedCount: Math.round(lowStarPct * seededComments.length),
        fixable: false,
        affectedIds: [],
      });
    }
  }

  return { totalChecked: seededComments.length, issues, runAt: new Date() };
}

// ---------------------------------------------------------------------------
// Auto-fixer
// ---------------------------------------------------------------------------

export interface AutoFixResult {
  fixed: number;
  skipped: number;
  details: string[];
}

/**
 * Attempts to automatically resolve fixable audit issues.
 * - Duplicate content: deletes the duplicate comment documents
 * - Future timestamps: resets them to "1 hour ago"
 * Returns a summary of what was done.
 */
export async function autoFixIssues(issues: AuditIssue[]): Promise<AutoFixResult> {
  let fixed = 0;
  let skipped = 0;
  const details: string[] = [];
  const oneHourAgo = Timestamp.fromDate(new Date(Date.now() - 3_600_000));

  for (const issue of issues) {
    if (!issue.fixable || issue.affectedIds.length === 0) {
      skipped++;
      continue;
    }

    if (issue.type === "duplicate_content") {
      for (const id of issue.affectedIds) {
        try {
          await deleteDoc(doc(db, "comments", id));
          fixed++;
        } catch (e: any) {
          details.push(`Failed to delete ${id}: ${e.message}`);
        }
      }
      details.push(`Deleted ${issue.affectedIds.length} duplicate comment(s).`);
    }

    if (issue.type === "future_timestamp") {
      for (const id of issue.affectedIds) {
        try {
          await updateDoc(doc(db, "comments", id), {
            createdAt: oneHourAgo,
            updatedAt: oneHourAgo,
          });
          fixed++;
        } catch (e: any) {
          details.push(`Failed to fix timestamp on ${id}: ${e.message}`);
        }
      }
      details.push(`Reset ${issue.affectedIds.length} future timestamp(s) to 1 hour ago.`);
    }
  }

  return { fixed, skipped, details };
}

// ---------------------------------------------------------------------------
// Fetch seeded comments for audit
// ---------------------------------------------------------------------------

/** Fetches all seeded comments from Firestore for an audit run. */
export async function fetchSeededForAudit(): Promise<CommentDoc[]> {
  const snap = await getDocs(
    query(collection(db, "comments"), where("userId", "==", "system-seed"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CommentDoc, "id">) }));
}
