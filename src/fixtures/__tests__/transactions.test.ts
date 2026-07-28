import {
  txTransferSuccess,
  txMintSuccess,
  txPending,
  txFailed,
  txFailedNotWhitelisted,
} from '@/fixtures'

describe('Transaction fixtures', () => {
  it('successful transfer has success status', () => {
    expect(txTransferSuccess.status).toBe('success')
    expect(txTransferSuccess.txHash).toBeTruthy()
  })

  it('successful mint has success status and no from', () => {
    expect(txMintSuccess.status).toBe('success')
    expect(txMintSuccess.from).toBeUndefined()
    expect(txMintSuccess.to).toBeTruthy()
  })

  it('pending transaction has pending status', () => {
    expect(txPending.status).toBe('pending')
  })

  it('failed transaction has error message', () => {
    expect(txFailed.status).toBe('failed')
    expect(txFailed.error).toBeTruthy()
  })

  it('failed not-whitelisted has specific error', () => {
    expect(txFailedNotWhitelisted.error).toContain('KYC whitelisted')
  })

  it('all receipts have txHash', () => {
    const receipts = [txTransferSuccess, txMintSuccess, txPending, txFailed, txFailedNotWhitelisted]
    for (const r of receipts) {
      expect(r.txHash).toBeTruthy()
      expect(r.txHash.length).toBeGreaterThan(10)
    }
  })
})
