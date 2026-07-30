/**
 * src/lib/status/severity.ts
 *
 * Severity mapping for the shared status system. (Issue #182)
 *
 * Provides the canonical tone -> severity mapping, ordering for sorting a
 * mixed list of statuses by urgency, and a bridge to the pre-existing
 * `ReviewSeverity` type used by the compliance review queue so the two
 * severity concepts stay consistent rather than drifting apart.
 */

import type { ReviewSeverity } from '@/lib/complianceReview';
import type { StatusSeverity, StatusTone } from './types';

/** Ascending urgency order. Index doubles as a sortable weight. */
export const SEVERITY_ORDER: StatusSeverity[] = ['none', 'low', 'medium', 'high', 'critical'];

/** Canonical tone -> severity mapping used by every domain mapper. */
export const TONE_SEVERITY: Record<StatusTone, StatusSeverity> = {
  success: 'none',
  neutral: 'low',
  unknown: 'medium',
  caution: 'high',
  critical: 'critical',
};

/** Look up the default severity for a tone. */
export function severityForTone(tone: StatusTone): StatusSeverity {
  return TONE_SEVERITY[tone];
}

/** Numeric weight for a severity, for sorting (higher = more urgent). */
export function severityWeight(severity: StatusSeverity): number {
  return SEVERITY_ORDER.indexOf(severity);
}

/**
 * Compare two severities for sorting, most urgent first.
 * Usable directly as an Array.prototype.sort comparator over StatusInfo:
 * `list.sort((a, b) => compareSeverity(b.severity, a.severity))` for
 * least-urgent-first, or flip operands for most-urgent-first.
 */
export function compareSeverity(a: StatusSeverity, b: StatusSeverity): number {
  return severityWeight(a) - severityWeight(b);
}

/** Whether `severity` meets or exceeds `threshold` in urgency. */
export function isAtLeastSeverity(severity: StatusSeverity, threshold: StatusSeverity): boolean {
  return severityWeight(severity) >= severityWeight(threshold);
}

/**
 * Bridge to the compliance review queue's own `ReviewSeverity` type
 * (src/lib/complianceReview.ts), which predates this module and remains the
 * source of truth for review-queue severity. `ReviewSeverity` has no 'none'
 * value, so this is a lossless one-way mapping into `StatusSeverity`.
 */
export function severityForReviewSeverity(severity: ReviewSeverity): StatusSeverity {
  return severity;
}
