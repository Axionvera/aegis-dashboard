/**
 * Address-level compliance status for the dashboard status panel.
 *
 * Distinct from asset-level badges (`src/lib/aegis/types.ts`) and bulk review
 * statuses (`src/lib/complianceReview.ts`). This model describes whether a
 * wallet address is approved / blocked / pending / revoked / unknown /
 * unavailable according to the protocol compliance registry.
 */

export type AddressComplianceState =
  | 'approved'
  | 'blocked'
  | 'pending'
  | 'revoked'
  | 'unknown'
  | 'unavailable';

/** Raw shape expected from the SDK / mock provider before normalisation. */
export interface RawAddressComplianceRecord {
  address: string;
  /**
   * Provider-native state string. May use alternate spellings
   * (e.g. `not_approved`, `REJECTED`) that the mapper normalises.
   */
  status?: string | null;
  /** Optional protocol-level reason code from the registry. */
  reasonCode?: string | null;
  /** Optional free-form detail from the provider. */
  detail?: string | null;
  /** ISO timestamp of the last registry evaluation, when known. */
  evaluatedAt?: string | null;
  /** True when the provider could not reach the registry. */
  unavailable?: boolean;
}

/** Normalised panel model consumed by ComplianceStatusPanel. */
export interface AddressComplianceStatus {
  address: string;
  state: AddressComplianceState;
  /** Short badge label, e.g. "Approved". */
  label: string;
  /** Safe explanatory copy for investors/admins (protocol-level only). */
  explanation: string;
  reasonCode?: string;
  evaluatedAt?: string;
  /** Where the record came from for diagnostics/debug. */
  source: 'sdk' | 'fixture' | 'fallback';
}
