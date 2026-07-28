/**
 * Transaction receipt fixtures for testing transfer confirmations,
 * mint confirmations, and transaction history display.
 */

export interface TransactionReceipt {
  txHash: string
  status: 'success' | 'pending' | 'failed'
  from?: string
  to?: string
  amount?: number
  ticker?: string
  timestamp?: string
  error?: string
}

/** A successful transfer receipt. */
export const txTransferSuccess: TransactionReceipt = {
  txHash: 'TXSUCCESS-FOR-FIXTURE-ONLY-1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  status: 'success',
  from: 'GTXFROM-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  to: 'GTXTO----ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  amount: 250.0,
  ticker: 'NY-CRE',
  timestamp: '2026-01-15T14:30:00Z',
}

/** A successful mint receipt (admin). */
export const txMintSuccess: TransactionReceipt = {
  txHash: 'TXMINT---FOR-FIXTURE-ONLY-1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  status: 'success',
  to: 'GTXMINT--ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  amount: 1000,
  ticker: 'UST-6M',
  timestamp: '2026-01-15T15:00:00Z',
}

/** A pending transaction. */
export const txPending: TransactionReceipt = {
  txHash: 'TXPENDING-FOR-FIXTURE-ONLY-1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  status: 'pending',
  from: 'GTXFROM-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  to: 'GTXTO----ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  amount: 100,
  ticker: 'NY-CRE',
}

/** A failed transaction. */
export const txFailed: TransactionReceipt = {
  txHash: 'TXFAILED-FOR-FIXTURE-ONLY-1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  status: 'failed',
  from: 'GTXFROM-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  to: 'GTXTO----ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  amount: 500,
  ticker: 'NY-CRE',
  error: 'Insufficient balance',
}

/** A failed transaction: recipient not whitelisted. */
export const txFailedNotWhitelisted: TransactionReceipt = {
  txHash: 'TXNO-KYC--FOR-FIXTURE-ONLY-1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  status: 'failed',
  from: 'GTXFROM-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  to: 'GTXTO----ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  amount: 100,
  ticker: 'UST-6M',
  error: 'Recipient is not KYC whitelisted.',
}
