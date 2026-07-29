import type {
  AddressComplianceState,
  AddressComplianceStatus,
  RawAddressComplianceRecord,
} from '@/features/compliance/types';

interface StatePresentation {
  label: string;
  explanation: string;
}

/**
 * Protocol-level copy only. Never claims real-world KYC completion,
 * legal approval, or regulatory clearance.
 */
export const ADDRESS_COMPLIANCE_PRESENTATION: Record<
  AddressComplianceState,
  StatePresentation
> = {
  approved: {
    label: 'Approved',
    explanation:
      'This address is currently marked approved in the protocol compliance registry for dashboard actions.',
  },
  blocked: {
    label: 'Blocked',
    explanation:
      'This address is currently blocked from protocol actions by the compliance registry.',
  },
  pending: {
    label: 'Pending',
    explanation:
      'Compliance review for this address is still pending in the protocol registry.',
  },
  revoked: {
    label: 'Revoked',
    explanation:
      'Prior protocol approval for this address has been revoked in the compliance registry.',
  },
  unknown: {
    label: 'Unknown',
    explanation:
      'No clear compliance record was returned for this address from the protocol registry.',
  },
  unavailable: {
    label: 'Unavailable',
    explanation:
      'Compliance data for this address could not be retrieved right now. Try again later.',
  },
};

const STATUS_ALIASES: Record<string, AddressComplianceState> = {
  approved: 'approved',
  approve: 'approved',
  compliant: 'approved',
  whitelisted: 'approved',
  allowed: 'approved',
  blocked: 'blocked',
  block: 'blocked',
  restricted: 'blocked',
  denied: 'blocked',
  rejected: 'blocked',
  revoked: 'revoked',
  revoke: 'revoked',
  suspended: 'revoked',
  'not-approved': 'revoked',
  not_approved: 'revoked',
  notapproved: 'revoked',
  pending: 'pending',
  pending_review: 'pending',
  'pending-review': 'pending',
  review: 'pending',
  in_review: 'pending',
  unknown: 'unknown',
  unavailable: 'unavailable',
  error: 'unavailable',
  timeout: 'unavailable',
};

export function normalizeAddressComplianceState(
  raw?: string | null,
  unavailable = false,
): AddressComplianceState {
  if (unavailable) return 'unavailable';
  if (!raw || !raw.trim()) return 'unknown';

  const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
  return STATUS_ALIASES[key] ?? 'unknown';
}

/**
 * Maps a raw SDK / mock compliance record into the panel model.
 * Always produces a safe fallback rather than throwing on malformed input.
 */
export function mapAddressComplianceStatus(
  record: RawAddressComplianceRecord,
  source: AddressComplianceStatus['source'] = 'sdk',
): AddressComplianceStatus {
  const state = normalizeAddressComplianceState(record.status, Boolean(record.unavailable));
  const presentation = ADDRESS_COMPLIANCE_PRESENTATION[state];

  return {
    address: record.address,
    state,
    label: presentation.label,
    explanation: record.detail?.trim()
      ? record.detail.trim()
      : presentation.explanation,
    reasonCode: record.reasonCode?.trim() || undefined,
    evaluatedAt: record.evaluatedAt?.trim() || undefined,
    source,
  };
}

export function unavailableComplianceStatus(
  address: string,
  detail?: string,
): AddressComplianceStatus {
  return mapAddressComplianceStatus(
    {
      address,
      status: 'unavailable',
      unavailable: true,
      detail,
    },
    'fallback',
  );
}
