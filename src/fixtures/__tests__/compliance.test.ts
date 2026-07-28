import {
  complianceWhitelisted,
  complianceNotWhitelisted,
  complianceRevoked,
  compliancePending,
  mockCheckWhitelist,
} from '@/fixtures'

describe('Compliance fixtures', () => {
  it('whitelisted user has isWhitelisted true', () => {
    expect(complianceWhitelisted.isWhitelisted).toBe(true)
  })

  it('not-whitelisted user has isWhitelisted false', () => {
    expect(complianceNotWhitelisted.isWhitelisted).toBe(false)
  })

  it('revoked user has a reason', () => {
    expect(complianceRevoked.isWhitelisted).toBe(false)
    expect(complianceRevoked.reason).toBeTruthy()
  })

  it('pending user has a reason', () => {
    expect(compliancePending.isWhitelisted).toBe(false)
    expect(compliancePending.reason).toContain('compliance officer')
  })

  it('mockCheckWhitelist returns true for valid-length G address', async () => {
    const result = await mockCheckWhitelist('G' + 'A'.repeat(55))
    expect(result).toBe(true)
  })

  it('mockCheckWhitelist returns false for short address', async () => {
    const result = await mockCheckWhitelist('GABC')
    expect(result).toBe(false)
  })

  it('mockCheckWhitelist returns false for non-G address', async () => {
    const result = await mockCheckWhitelist('XABCDEF')
    expect(result).toBe(false)
  })
})
