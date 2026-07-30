/**
 * src/lib/status/types.ts
 *
 * Shared status system — core types. (Issue #182)
 *
 * Several domains in this codebase (compliance, asset lifecycle, transfer
 * eligibility, asset issuance, transactions, wallet whitelist, diagnostics)
 * each define their own status enum, which is correct — they are genuinely
 * different state machines. What they should NOT each define independently
 * is how a status is *labelled, coloured, and prioritised* for display.
 *
 * This module is that shared layer. A domain mapper (see domainMappers.ts)
 * converts a domain-specific status into a `StatusInfo`; UI code then renders
 * `StatusInfo` the same way everywhere via `StatusBadge`
 * (src/components/status/StatusBadge.tsx).
 *
 * This module has no React and no domain imports, so it can be unit-tested
 * in isolation and reused by any future surface.
 */

/**
 * Visual/semantic category a status falls into. Every domain status maps to
 * exactly one tone. Tones are intentionally domain-agnostic — "critical"
 * means the same visual treatment whether it comes from a rejected KYC
 * check or a failed transaction.
 */
export type StatusTone = 'success' | 'neutral' | 'caution' | 'critical' | 'unknown';

/**
 * How urgently a status should draw attention, independent of tone's visual
 * styling. Useful for sorting/filtering a table by "what needs attention
 * first" across mixed status types.
 *
 * Deliberately a superset of `ReviewSeverity` (src/lib/complianceReview.ts)
 * — 'none' is added for statuses that need no attention at all (e.g. a
 * successful transaction). Compliance's own `ReviewSeverity` type is
 * unchanged and continues to be the source of truth for review-queue
 * severity; `severityForReviewSeverity` in severity.ts bridges the two.
 */
export type StatusSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

/** The normalised, renderable shape every domain mapper produces. */
export interface StatusInfo {
  /** Short label shown in the badge, e.g. "Compliant", "Whitelisted". */
  label: string;
  /** Visual/semantic category — drives colour via toneStyles.ts. */
  tone: StatusTone;
  /** How urgently this status needs attention. */
  severity: StatusSeverity;
  /** Optional longer explanation, typically shown as a tooltip. */
  detail?: string;
}
