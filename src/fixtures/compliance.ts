/**
 * Compliance (KYC whitelist) fixtures for testing whitelist checks,
 * revocation scenarios, and edge cases.
 *
 * All addresses are non-real Stellar public key patterns.
 */

export interface ComplianceFixture {
  address: string
  isWhitelisted: boolean
  reason?: string
}

/** A user who is KYC whitelisted. */
export const complianceWhitelisted: ComplianceFixture = {
  address: 'GCOMPLIANT-WHITELISTED-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABC',
  isWhitelisted: true,
}

/** A user who is NOT KYC whitelisted. */
export const complianceNotWhitelisted: ComplianceFixture = {
  address: 'GCOMPLIANT-NOTWHITLST-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABC',
  isWhitelisted: false,
}

/** A user whose whitelist status was revoked. */
export const complianceRevoked: ComplianceFixture = {
  address: 'GCOMPLIANT-REVOKED----ADDRESS-FOR-FIXTURE-ONLY-1234567890ABC',
  isWhitelisted: false,
  reason: 'KYC documentation expired',
}

/** A user pending KYC review. */
export const compliancePending: ComplianceFixture = {
  address: 'GCOMPLIANT-PENDING----ADDRESS-FOR-FIXTURE-ONLY-1234567890ABC',
  isWhitelisted: false,
  reason: 'Awaiting compliance officer review',
}

/** Mock checkWhitelist function: returns true for whitelisted addresses. */
export const mockCheckWhitelist = async (address: string): Promise<boolean> => {
  return address.startsWith('G') && address.length > 50
}
