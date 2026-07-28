/**
 * SDK and contract error fixtures for testing error handling,
 * error message display, and retry flows.
 *
 * These simulate errors from @aegis/sdk, Freighter, and Soroban RPC.
 */

export interface SdkError {
  code: string
  message: string
  category: 'wallet' | 'contract' | 'network' | 'validation'
}

/** Wallet not connected. */
export const errorWalletNotConnected: SdkError = {
  code: 'WALLET_NOT_CONNECTED',
  message: 'Please install Freighter wallet!',
  category: 'wallet',
}

/** Wallet connection rejected by user. */
export const errorWalletRejected: SdkError = {
  code: 'WALLET_REJECTED',
  message: 'Wallet connection was rejected by the user.',
  category: 'wallet',
}

/** Network mismatch between wallet and expected network. */
export const errorNetworkMismatch: SdkError = {
  code: 'NETWORK_MISMATCH',
  message: 'Wallet is connected to the wrong network. Expected testnet.',
  category: 'network',
}

/** Soroban RPC unreachable. */
export const errorRpcUnavailable: SdkError = {
  code: 'RPC_UNAVAILABLE',
  message: 'Unable to connect to Soroban RPC. Please try again later.',
  category: 'network',
}

/** Contract call failed: insufficient balance. */
export const errorInsufficientBalance: SdkError = {
  code: 'INSUFFICIENT_BALANCE',
  message: 'Insufficient balance for this transfer.',
  category: 'contract',
}

/** Contract call failed: recipient not whitelisted. */
export const errorNotWhitelisted: SdkError = {
  code: 'NOT_WHITELISTED',
  message: 'Recipient is not KYC whitelisted.',
  category: 'contract',
}

/** Contract call failed: unauthorized (wrong role). */
export const errorUnauthorized: SdkError = {
  code: 'UNAUTHORIZED',
  message: 'Unauthorized: required role not held.',
  category: 'contract',
}

/** Contract call failed: contract is paused. */
export const errorContractPaused: SdkError = {
  code: 'CONTRACT_PAUSED',
  message: 'Contract is paused. All state-changing operations are blocked.',
  category: 'contract',
}

/** Validation error: invalid Stellar address format. */
export const errorInvalidAddress: SdkError = {
  code: 'INVALID_ADDRESS',
  message: 'Invalid Stellar address format.',
  category: 'validation',
}

/** Validation error: amount must be positive. */
export const errorAmountNotPositive: SdkError = {
  code: 'AMOUNT_NOT_POSITIVE',
  message: 'Amount must be greater than zero.',
  category: 'validation',
}

/** Generic unknown error. */
export const errorUnknown: SdkError = {
  code: 'UNKNOWN',
  message: 'An unexpected error occurred.',
  category: 'contract',
}
