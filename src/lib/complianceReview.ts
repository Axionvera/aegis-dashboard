/**
 * Bulk compliance review table — core types, data model, and pure logic.
 *
 * This module is intentionally framework-agnostic (no React) so the review
 * engine can be unit-tested without a DOM and reused by both the dashboard
 * UI and any future SDK/dashboard boundary.
 *
 * NOTE: This implements *protocol-level* compliance mechanics only. It is not
 * legal, regulatory, or financial advice, and does not determine whether any
 * specific investor is permitted to hold an RWA token under applicable law.
 */

/** Lifecycle state of a single compliance subject (e.g. an investor address). */
export type ComplianceStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "review";

/** Severity used to prioritise and triage bulk review queues. */
export type ReviewSeverity = "low" | "medium" | "high" | "critical";

/** Outcome of an individual compliance check against a subject. */
export type CheckResult = "pass" | "fail" | "warn" | "unknown";

/** A single, named compliance check evaluated against a subject. */
export interface ComplianceCheck {
  /** Stable machine key for the check (e.g. "kyc_verified"). */
  key: string;
  /** Human-readable label shown in the table. */
  label: string;
  result: CheckResult;
  /**
   * Free-form detail (e.g. "Expires 2026-09-01"). Optional.
   * Avoid storing raw PII; reference external identifiers instead.
   */
  detail?: string;
  /** When the check was last evaluated (ISO 8601). Optional. */
  evaluatedAt?: string;
}

/**
 * A row in the bulk compliance review table.
 * `id` is typically a Stellar address (or other stable subject identifier).
 */
export interface ComplianceSubject {
  id: string;
  status: ComplianceStatus;
  severity: ReviewSeverity;
  /** Ordered list of checks for this subject. */
  checks: ComplianceCheck[];
  /** Whether the connected admin has locally selected this row for bulk action. */
  selected?: boolean;
  /** Arbitrary, non-PII metadata (e.g. jurisdiction code). Optional. */
  meta?: Record<string, string>;
}

/** The aggregate state of the bulk review table. */
export interface ComplianceReviewState {
  subjects: ComplianceSubject[];
  /** Count of subjects selected for a bulk action. */
  selectedCount: number;
  /** Whether every visible subject is selected. */
  allSelected: boolean;
  lastUpdated?: string;
}

/** Mutually exclusive bulk actions an admin can apply to selected rows. */
export type BulkAction = "approve" | "reject" | "flag-for-review" | "clear";

/**
 * Decision rule describing how a set of check results maps to a recommended
 * status. Kept declarative so it can be unit-tested and reused.
 */
export interface ReviewRule {
  /** If any check `fail`s, force this status. */
  onAnyFail: ComplianceStatus;
  /** If any check `warn`s (and none failed), use this status. */
  onAnyWarn: ComplianceStatus;
  /** If all checks `pass`, use this status. */
  onAllPass: ComplianceStatus;
  /** If any check is `unknown`, use this status. */
  onAnyUnknown: ComplianceStatus;
}

export const DEFAULT_REVIEW_RULE: ReviewRule = {
  onAnyFail: "rejected",
  onAnyWarn: "review",
  onAllPass: "approved",
  onAnyUnknown: "pending",
};

/**
 * Derive a recommended compliance status from a subject's checks.
 * Pure — no side effects, fully testable.
 */
export function deriveStatus(
  checks: ComplianceCheck[],
  rule: ReviewRule = DEFAULT_REVIEW_RULE,
): ComplianceStatus {
  if (checks.length === 0) return rule.onAnyUnknown;
  const results = checks.map((c) => c.result);
  if (results.some((r) => r === "fail")) return rule.onAnyFail;
  if (results.some((r) => r === "unknown")) return rule.onAnyUnknown;
  if (results.some((r) => r === "warn")) return rule.onAnyWarn;
  return rule.onAllPass;
}

const SEVERITY_RANK: Record<ReviewSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/**
 * Rank severity for sorting/triage. Higher number == higher priority.
 */
export function severityRank(s: ReviewSeverity): number {
  return SEVERITY_RANK[s];
}

/**
 * Filter subjects by a free-text query. Matches against `id` and any `meta`
 * values (case-insensitive). Non-PII by design.
 */
export function filterSubjects(
  subjects: ComplianceSubject[],
  query: string,
): ComplianceSubject[] {
  const q = query.trim().toLowerCase();
  if (!q) return subjects;
  return subjects.filter((s) => {
    if (s.id.toLowerCase().includes(q)) return true;
    if (!s.meta) return false;
    return Object.values(s.meta).some((v) => v.toLowerCase().includes(q));
  });
}

/**
 * Tally how many subjects fall into each status. Useful for table summary
 * chips and for assertions in tests.
 */
export function tallyByStatus(
  subjects: ComplianceSubject[],
): Record<ComplianceStatus, number> {
  const tally: Record<ComplianceStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    review: 0,
  };
  for (const s of subjects) tally[s.status] += 1;
  return tally;
}

/**
 * Produce the next state after applying a bulk action to the currently
 * selected rows. Selection is cleared after the action (standard table UX).
 * Pure — returns a new array, does not mutate the input.
 *
 * `selectedIds` lets callers reuse this for partial selections; if omitted,
 * all `selected` rows are acted on.
 */
export function applyBulkAction(
  state: ComplianceReviewState,
  action: BulkAction,
  selectedIds?: string[],
): ComplianceReviewState {
  const ids = new Set(selectedIds ?? state.subjects.filter((s) => s.selected).map((s) => s.id));
  if (ids.size === 0) return state;

  const nextSubjects = state.subjects.map((s) => {
    if (!ids.has(s.id)) return s;
    switch (action) {
      case "approve":
        return { ...s, status: "approved" as ComplianceStatus, selected: false };
      case "reject":
        return { ...s, status: "rejected" as ComplianceStatus, selected: false };
      case "flag-for-review":
        return { ...s, status: "review" as ComplianceStatus, selected: false };
      case "clear":
        return { ...s, selected: false };
      default:
        return s;
    }
  });

  return recomputeSelection(nextSubjects);
}

/**
 * Recompute derived selection fields. Centralised so callers never have to
 * keep `selectedCount`/`allSelected` in sync manually.
 */
export function recomputeSelection(
  subjects: ComplianceSubject[],
): ComplianceReviewState {
  const selectedCount = subjects.filter((s) => s.selected).length;
  return {
    subjects,
    selectedCount,
    allSelected: subjects.length > 0 && selectedCount === subjects.length,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Toggle a single row's selection. Pure.
 */
export function toggleSelection(
  state: ComplianceReviewState,
  id: string,
): ComplianceReviewState {
  const next = state.subjects.map((s) =>
    s.id === id ? { ...s, selected: !s.selected } : s,
  );
  return recomputeSelection(next);
}

/**
 * Set the selection state of every row. `value=true` selects all; `false`
 * clears all. Pure.
 */
export function setSelectionAll(
  state: ComplianceReviewState,
  value: boolean,
): ComplianceReviewState {
  const next = state.subjects.map((s) => ({ ...s, selected: value }));
  return recomputeSelection(next);
}
