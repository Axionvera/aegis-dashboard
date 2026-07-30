/**
 * src/lib/status/index.ts
 *
 * Barrel for the shared status system. See docs/status-system.md.
 */

export type { StatusTone, StatusSeverity, StatusInfo } from './types';

export {
  SEVERITY_ORDER,
  TONE_SEVERITY,
  severityForTone,
  severityWeight,
  compareSeverity,
  isAtLeastSeverity,
  severityForReviewSeverity,
} from './severity';

export type { StatusBadgeVariant } from './toneStyles';
export { TONE_PILL_STYLES, TONE_OUTLINE_STYLES, TONE_CARD_STYLES, toneClassName } from './toneStyles';

export {
  statusForComplianceState,
  statusForReviewSeverity,
  statusForTransferEligibility,
  statusForAssetLifecycle,
  statusForIssuanceRequest,
  statusForTransaction,
  statusForWhitelistEntry,
  statusForDiagnostics,
} from './domainMappers';
export type { DiagnosticsCardStatus } from './domainMappers';
