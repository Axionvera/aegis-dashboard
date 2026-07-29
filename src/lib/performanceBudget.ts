/**
 * Performance budget review for the Aegis Dashboard.
 *
 * A performance budget defines acceptable thresholds for portfolio
 * metrics (concentration, exposure, liquidity, etc.). The review
 * engine evaluates assets or portfolios against these budgets and
 * produces a typed result that the dashboard can render.
 *
 * This module is intentionally framework-agnostic (no React) so the
 * review engine can be unit-tested without a DOM and reused by both
 * the dashboard UI and any future SDK/dashboard boundary.
 *
 * NOTE: This implements *protocol-level* performance budget mechanics
 * only. User-facing copy derived from this module should use
 * {@link COMPLIANCE_DISCLAIMER} (or {@link withDisclaimer}) to ensure
 * the mandated "not legal, regulatory, or financial advice" message
 * is always present.
 */

import { COMPLIANCE_DISCLAIMER, withDisclaimer } from './complianceReview';

/** The outcome of a single budget check against a threshold. */
export type BudgetCheckResult = 'pass' | 'fail' | 'warn' | 'unknown';

/** A single named budget check evaluated against a metric. */
export interface BudgetCheck {
  /** Stable machine key for the check (e.g. "concentration_ratio"). */
  key: string;
  /** Human-readable label shown in the table. */
  label: string;
  result: BudgetCheckResult;
  /** The actual measured value, if available. */
  actual: number | null;
  /** The threshold value the metric was compared against. */
  threshold: number;
  /** Longer explanation surfaced in tooltips/detail views. */
  detail?: string;
  /** When the check was last evaluated (ISO 8601). Optional. */
  evaluatedAt?: string;
}

/** The overall review outcome for a single budget applied to a subject. */
export type BudgetReviewStatus = 'compliant' | 'warning' | 'breached' | 'unknown';

/** A single budget review result for one subject (e.g. one portfolio). */
export interface BudgetReviewResult {
  /** Stable machine key for the budget. */
  budgetId: string;
  /** Human-readable budget name. */
  budgetName: string;
  status: BudgetReviewStatus;
  /** Ordered list of checks for this budget. */
  checks: BudgetCheck[];
  /** Whether the connected admin has locally selected this row for bulk action. */
  selected?: boolean;
  /** Arbitrary, non-PII metadata (e.g. portfolio name, currency). Optional. */
  meta?: Record<string, string>;
}

/** The aggregate state of the budget review table. */
export interface BudgetReviewState {
  results: BudgetReviewResult[];
  /** Count of results selected for a bulk action. */
  selectedCount: number;
  /** Whether every visible result is selected. */
  allSelected: boolean;
  lastUpdated?: string;
}

/** Mutually exclusive bulk actions an admin can apply to selected rows. */
export type BudgetBulkAction = 'approve' | 'flag-for-review' | 'reject' | 'clear';

/** Decision rule describing how a set of check results maps to a recommended status. */
export interface BudgetReviewRule {
  /** If any check `fail`s, force this status. */
  onAnyFail: BudgetReviewStatus;
  /** If any check `warn`s (and none failed), use this status. */
  onAnyWarn: BudgetReviewStatus;
  /** If all checks `pass`, use this status. */
  onAllPass: BudgetReviewStatus;
  /** If any check is `unknown`, use this status. */
  onAnyUnknown: BudgetReviewStatus;
}

export const DEFAULT_BUDGET_REVIEW_RULE: BudgetReviewRule = {
  onAnyFail: 'breached',
  onAnyWarn: 'warning',
  onAllPass: 'compliant',
  onAnyUnknown: 'unknown',
};

/**
 * Derive a recommended budget review status from a set of checks.
 * Pure — no side effects, fully testable.
 */
export function deriveBudgetStatus(
  checks: BudgetCheck[],
  rule: BudgetReviewRule = DEFAULT_BUDGET_REVIEW_RULE,
): BudgetReviewStatus {
  if (checks.length === 0) return rule.onAnyUnknown;
  const results = checks.map((c) => c.result);
  if (results.some((r) => r === 'fail')) return rule.onAnyFail;
  if (results.some((r) => r === 'unknown')) return rule.onAnyUnknown;
  if (results.some((r) => r === 'warn')) return rule.onAnyWarn;
  return rule.onAllPass;
}

const BUDGET_STATUS_ORDER: Record<BudgetReviewStatus, number> = {
  compliant: 0,
  warning: 1,
  breached: 2,
  unknown: 3,
};

/**
 * Rank budget review status for sorting/triage. Higher number == higher priority.
 */
export function budgetStatusRank(s: BudgetReviewStatus): number {
  return BUDGET_STATUS_ORDER[s];
}

/**
 * Filter budget review results by a free-text query. Matches against
 * `budgetId`, `budgetName`, and any `meta` values (case-insensitive).
 * Non-PII by design.
 */
export function filterBudgetResults(
  results: BudgetReviewResult[],
  query: string,
): BudgetReviewResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return results;
  return results.filter((r) => {
    if (r.budgetId.toLowerCase().includes(q)) return true;
    if (r.budgetName.toLowerCase().includes(q)) return true;
    if (!r.meta) return false;
    return Object.values(r.meta).some((v) => v.toLowerCase().includes(q));
  });
}

/**
 * Tally how many results fall into each status. Useful for table summary
 * chips and for assertions in tests.
 */
export function tallyBudgetResults(
  results: BudgetReviewResult[],
): Record<BudgetReviewStatus, number> {
  const tally: Record<BudgetReviewStatus, number> = {
    compliant: 0,
    warning: 0,
    breached: 0,
    unknown: 0,
  };
  for (const r of results) tally[r.status] += 1;
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
export function applyBudgetBulkAction(
  state: BudgetReviewState,
  action: BudgetBulkAction,
  selectedIds?: string[],
): BudgetReviewState {
  const ids = new Set(
    selectedIds ?? state.results.filter((r) => r.selected).map((r) => r.budgetId),
  );
  if (ids.size === 0) return state;

  const nextResults = state.results.map((r) => {
    if (!ids.has(r.budgetId)) return r;
    switch (action) {
      case 'approve':
        return { ...r, status: 'compliant' as BudgetReviewStatus, selected: false };
      case 'reject':
        return { ...r, status: 'breached' as BudgetReviewStatus, selected: false };
      case 'flag-for-review':
        return { ...r, status: 'warning' as BudgetReviewStatus, selected: false };
      case 'clear':
        return { ...r, selected: false };
      default:
        return r;
    }
  });

  return recomputeBudgetSelection(nextResults);
}

/**
 * Recompute derived selection fields. Centralised so callers never have to
 * keep `selectedCount`/`allSelected` in sync manually.
 */
export function recomputeBudgetSelection(
  results: BudgetReviewResult[],
): BudgetReviewState {
  const selectedCount = results.filter((r) => r.selected).length;
  return {
    results,
    selectedCount,
    allSelected: results.length > 0 && selectedCount === results.length,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Toggle a single row's selection. Pure.
 */
export function toggleBudgetSelection(
  state: BudgetReviewState,
  id: string,
): BudgetReviewState {
  const next = state.results.map((r) =>
    r.budgetId === id ? { ...r, selected: !r.selected } : r,
  );
  return recomputeBudgetSelection(next);
}

/**
 * Set the selection state of every row. `value=true` selects all; `false`
 * clears all. Pure.
 */
export function setBudgetSelectionAll(
  state: BudgetReviewState,
  value: boolean,
): BudgetReviewState {
  const next = state.results.map((r) => ({ ...r, selected: value }));
  return recomputeBudgetSelection(next);
}

/**
 * Format a numeric value for display. Returns "N/A" when the value is
 * null (metric could not be measured).
 */
export function formatBudgetValue(value: number | null): string {
  return value === null ? 'N/A' : value.toFixed(2);
}

/**
 * Build a compliance-safe label for a budget check result.
 * Uses the shared COMPLIANCE_DISCLAIMER pattern so protocol-level
 * results never imply legal or financial authority.
 */
export function budgetResultLabel(
  result: BudgetCheckResult,
  metric: string,
): string {
  const map: Record<BudgetCheckResult, string> = {
    pass: `${metric}: within budget`,
    fail: `${metric}: exceeds budget threshold`,
    warn: `${metric}: approaching budget limit`,
    unknown: `${metric}: data unavailable`,
  };
  return withDisclaimer(map[result]);
}

/**
 * Validate a set of budget checks for internal consistency.
 * Returns an array of human-readable error strings. Empty when valid.
 */
export function validateBudgetChecks(checks: BudgetCheck[]): string[] {
  const errors: string[] = [];
  const seenKeys = new Set<string>();

  for (const check of checks) {
    if (!check.key) {
      errors.push('A budget check is missing its required `key`.');
    } else if (seenKeys.has(check.key)) {
      errors.push(`Duplicate budget check key: "${check.key}".`);
    } else {
      seenKeys.add(check.key);
    }

    if (!check.label) {
      errors.push(`Budget check "${check.key}" is missing its required label.`);
    }
  }

  return errors;
}