import {
  errorWalletNotConnected,
  errorWalletRejected,
  errorNetworkMismatch,
  errorRpcUnavailable,
  errorInsufficientBalance,
  errorNotWhitelisted,
  errorUnauthorized,
  errorContractPaused,
  errorInvalidAddress,
  errorAmountNotPositive,
  errorUnknown,
} from '@/fixtures'

describe('Error fixtures', () => {
  const allErrors = [
    errorWalletNotConnected,
    errorWalletRejected,
    errorNetworkMismatch,
    errorRpcUnavailable,
    errorInsufficientBalance,
    errorNotWhitelisted,
    errorUnauthorized,
    errorContractPaused,
    errorInvalidAddress,
    errorAmountNotPositive,
    errorUnknown,
  ]

  it('all errors have code and message', () => {
    for (const err of allErrors) {
      expect(err.code).toBeTruthy()
      expect(err.message).toBeTruthy()
    }
  })

  it('all errors have a valid category', () => {
    const validCategories = ['wallet', 'contract', 'network', 'validation']
    for (const err of allErrors) {
      expect(validCategories).toContain(err.category)
    }
  })

  it('wallet errors have wallet category', () => {
    expect(errorWalletNotConnected.category).toBe('wallet')
    expect(errorWalletRejected.category).toBe('wallet')
  })

  it('network errors have network category', () => {
    expect(errorNetworkMismatch.category).toBe('network')
    expect(errorRpcUnavailable.category).toBe('network')
  })

  it('contract errors have contract category', () => {
    expect(errorInsufficientBalance.category).toBe('contract')
    expect(errorNotWhitelisted.category).toBe('contract')
    expect(errorUnauthorized.category).toBe('contract')
    expect(errorContractPaused.category).toBe('contract')
  })

  it('validation errors have validation category', () => {
    expect(errorInvalidAddress.category).toBe('validation')
    expect(errorAmountNotPositive.category).toBe('validation')
  })

  it('all error codes are unique', () => {
    const codes = allErrors.map((e) => e.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('error messages do not contain secrets or keys', () => {
    for (const err of allErrors) {
      expect(err.message.toLowerCase()).not.toContain('private key')
      expect(err.message.toLowerCase()).not.toContain('secret')
      expect(err.message.toLowerCase()).not.toContain('mnemonic')
    }
  })
})
