/**
 * src/lib/status/domainMappers.ts
 *
 * Domain mappers for the shared status system. (Issue #182)
 *
 * Each function below takes a status value from an existing domain module
 * and returns a `StatusInfo` — the same shape, rendered the same way,
 * regardless of which domain it came from. No domain's own status type
 * changes; this only adds a translation into the shared display layer.
 *
 * Covers every domain named in the issue: compliance, asset (lifecycle +
 * issuance + transfer eligibility), transaction, wallet (whitelist), and
 * diagnostics.
 */

import type { ComplianceState, TransferEligibilityState } from '@/lib/aegis/types';
import type { ReviewSeverity } from '@/lib/complianceReview';
import { AssetLifecycleState, LIFECYCLE_STATE_INFO } from '@/lib/assetLifecycle';
import type { IssuanceRequest } from '@/fixtures/issuer';
import type { TransactionStatus } from '@/features/transactions/types';
import type { WhitelistEntryStatus } from '@/lib/whitelist';
import type { StatusInfo, StatusTone } from './types';
import { severityForTone, severityForReviewSeverity } from './severity';

function info(label: string, tone: StatusTone, detail?: string): StatusInfo {
  return { label, tone, severity: severityForTone(tone), detail };
}

// ---------------------------------------------------------------------------
// Compliance (src/lib/aegis/types.ts — ComplianceState)
// ---------------------------------------------------------------------------

export function statusForComplianceState(state: ComplianceState): StatusInfo {
  switch (state) {
    case 'compliant':
      return info('Compliant', 'success', 'Investor KYC and accreditation checks are current.');
    case 'restricted':
      return info('Restricted', 'critical', 'This asset class is currently restricted for this investor.');
    case 'pending_review':
      return info('Pending Review', 'caution', 'The compliance registry has not returned a result yet.');
    default:
      return info(state, 'unknown');
  }
}

/**
 * Compliance review queue severity (src/lib/complianceReview.ts —
 * ReviewSeverity). This is already a severity, not a status label, so the
 * mapping goes the other direction: severity -> tone -> a generic label.
 */
export function statusForReviewSeverity(severity: ReviewSeverity): StatusInfo {
  const TONE_BY_SEVERITY: Record<ReviewSeverity, StatusTone> = {
    low: 'neutral',
    medium: 'unknown',
    high: 'caution',
    critical: 'critical',
  };
  const tone = TONE_BY_SEVERITY[severity];
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  return { label, tone, severity: severityForReviewSeverity(severity) };
}

// ---------------------------------------------------------------------------
// Asset — transfer eligibility (src/lib/aegis/types.ts)
// ---------------------------------------------------------------------------

export function statusForTransferEligibility(state: TransferEligibilityState): StatusInfo {
  switch (state) {
    case 'eligible':
      return info('Transfer Eligible', 'success');
    case 'ineligible':
      return info('Transfer Restricted', 'critical');
    case 'unknown':
      return info('Eligibility Unknown', 'unknown');
    default:
      return info(state, 'unknown');
  }
}

// ---------------------------------------------------------------------------
// Asset — lifecycle (src/lib/assetLifecycle.ts)
// ---------------------------------------------------------------------------

const LIFECYCLE_TONE: Record<string, StatusTone> = {
  positive: 'success',
  neutral: 'neutral',
  caution: 'caution',
  negative: 'critical',
};

export function statusForAssetLifecycle(state: AssetLifecycleState): StatusInfo {
  const lifecycleInfo = LIFECYCLE_STATE_INFO[state];
  const tone = LIFECYCLE_TONE[lifecycleInfo.tone];
  return { label: lifecycleInfo.label, tone, severity: severityForTone(tone), detail: lifecycleInfo.detail };
}

// ---------------------------------------------------------------------------
// Asset — issuance request (src/fixtures/issuer.ts)
// ---------------------------------------------------------------------------

export function statusForIssuanceRequest(status: IssuanceRequest['status']): StatusInfo {
  switch (status) {
    case 'draft':
      return info('Draft', 'neutral', 'Not yet submitted for compliance review.');
    case 'pending':
      return info('Pending', 'caution', 'Awaiting compliance review.');
    case 'approved':
      return info('Approved', 'success', 'Approved for minting.');
    case 'minted':
      return info('Minted', 'success', 'Supply has been issued on-chain.');
    case 'rejected':
      return info('Rejected', 'critical', 'The issuance request was rejected.');
    default:
      return info(status, 'unknown');
  }
}

// ---------------------------------------------------------------------------
// Transaction (src/features/transactions/types.ts — TransactionStatus)
// ---------------------------------------------------------------------------

export function statusForTransaction(status: TransactionStatus): StatusInfo {
  switch (status) {
    case 'success':
      return info('Success', 'success');
    case 'pending':
      return info('Pending', 'caution');
    case 'failed':
      return info('Failed', 'critical');
    case 'unknown':
      return info('Unknown', 'unknown');
    default:
      return info(status, 'unknown');
  }
}

// ---------------------------------------------------------------------------
// Wallet — KYC whitelist (src/lib/whitelist.ts — WhitelistEntryStatus)
// ---------------------------------------------------------------------------

export function statusForWhitelistEntry(status: WhitelistEntryStatus): StatusInfo {
  switch (status) {
    case 'whitelisted':
      return info('Whitelisted', 'success');
    case 'revoked':
      return info('Revoked', 'neutral');
    default:
      return info(status, 'unknown');
  }
}

// ---------------------------------------------------------------------------
// Diagnostics (src/features/diagnostics/components/StatusCard.tsx)
// ---------------------------------------------------------------------------

export type DiagnosticsCardStatus = 'ok' | 'warning' | 'error' | 'unknown';

export function statusForDiagnostics(status: DiagnosticsCardStatus): StatusInfo {
  switch (status) {
    case 'ok':
      return info('OK', 'success');
    case 'warning':
      return info('Warning', 'caution');
    case 'error':
      return info('Error', 'critical');
    case 'unknown':
      return info('Unknown', 'unknown');
    default:
      return info(status, 'unknown');
  }
}
