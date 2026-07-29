/**
 * Admin KYC whitelist management — core types and pure logic.
 *
 * This module is framework-agnostic (no React) so it can be unit-tested
 * without a DOM, mirroring the pattern established in complianceReview.ts
 * and audit.ts.
 *
 * NOTE: This implements *protocol-level* compliance mechanics only. Any
 * user-facing copy derived from this module should use
 * {@link COMPLIANCE_DISCLAIMER} from complianceReview.ts to ensure the
 * mandated "not legal, regulatory, or financial advice" message is present.
 *
 * @see docs/admin-whitelist-management.md
 */

/** Lifecycle state of a single whitelist entry. */
export type WhitelistEntryStatus = 'whitelisted' | 'revoked';

/** A single KYC-whitelisted (or previously whitelisted) investor address. */
export interface WhitelistEntry {
  /** Stellar public address (G...). */
  address: string;
  status: WhitelistEntryStatus;
  /** Wallet address of the admin who last changed this entry. */
  updatedBy: string;
  /** ISO 8601 timestamp of the most recent add/remove action. */
  updatedAt: string;
  /** Optional free-text note (e.g. KYC provider case reference). */
  note?: string;
}

/** Basic Stellar public-key shape check. Not a checksum validator. */
const STELLAR_ADDRESS_PATTERN = /^G[A-Z0-9]{55}$/;

export type WhitelistAddressValidation =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Validates a Stellar address before it's submitted for a whitelist action.
 * Pure client-side sanity check — the contract call is the source of truth.
 */
export function validateWhitelistAddress(rawAddress: string): WhitelistAddressValidation {
  const address = rawAddress.trim();

  if (!address) {
    return { valid: false, reason: 'An address is required.' };
  }
  if (!STELLAR_ADDRESS_PATTERN.test(address)) {
    return {
      valid: false,
      reason: 'Enter a valid Stellar public address (starts with G, 56 characters).',
    };
  }
  return { valid: true };
}

/**
 * Case-insensitive search across a whitelist entry's address and note.
 * Mirrors the `applyQuery` pattern from useTableFilters so this can be
 * dropped straight into that hook if the table grows sort/filter needs.
 */
export function searchWhitelistEntries(
  entries: WhitelistEntry[],
  query: string,
): WhitelistEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (entry) =>
      entry.address.toLowerCase().includes(q) ||
      (entry.note ? entry.note.toLowerCase().includes(q) : false),
  );
}

/**
 * Rejects attempts to submit a whitelist action that would be a no-op
 * against the entry's current state (e.g. removing an address that is
 * already revoked, or re-adding one that's already whitelisted).
 * Returns a reason string when the action should be blocked, or `null`
 * when it's safe to proceed.
 */
export function guardWhitelistAction(
  entries: WhitelistEntry[],
  address: string,
  action: 'add' | 'remove',
): string | null {
  const existing = entries.find(
    (e) => e.address.toLowerCase() === address.trim().toLowerCase(),
  );

  if (action === 'add' && existing?.status === 'whitelisted') {
    return 'This address is already whitelisted.';
  }
  if (action === 'remove' && (!existing || existing.status === 'revoked')) {
    return 'This address is not currently whitelisted.';
  }
  return null;
}
