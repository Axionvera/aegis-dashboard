/**
 * Investor Transfer Request — data model & validation. (Issue #41)
 *
 * This module intentionally has no React or SDK imports so it can be
 * unit-tested in isolation and reused by any future surface that needs to
 * validate a transfer request before it reaches TransferModal's review step,
 * the compliance check, or the SDK call itself.
 */

export type TransferValidationErrorCode =
  | 'MISSING_FIELDS'
  | 'INVALID_ADDRESS'
  | 'SELF_TRANSFER'
  | 'NON_POSITIVE_AMOUNT'
  | 'INSUFFICIENT_BALANCE'
  | 'PRECISION_OVERFLOW';

export interface TransferRequestInput {
  recipient: string;
  amount: string; // raw string from the input field, parsed during validation
}

export interface TransferRequestContext {
  senderAddress: string | null;
  availableBalance: number;
  /** Max decimal places the asset supports. Pass asset.decimals when known. */
  maxDecimals?: number;
}

export interface TransferValidationResult {
  valid: boolean;
  error?: TransferValidationErrorCode;
  /** Parsed amount, only present when valid. */
  parsedAmount?: number;
}

// Minimal shape check for a Stellar public key (starts with 'G', 56 chars,
// base32 alphabet). This is intentionally NOT a full checksum/StrKey
// validation — see docs/investor-transfer-request-flow.md for why.
export function isPlausibleStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function validateTransferRequest(
  input: TransferRequestInput,
  context: TransferRequestContext
): TransferValidationResult {
  const recipient = input.recipient.trim();
  const amountStr = input.amount.trim();

  if (!recipient || !amountStr) {
    return { valid: false, error: 'MISSING_FIELDS' };
  }

  if (!isPlausibleStellarAddress(recipient)) {
    return { valid: false, error: 'INVALID_ADDRESS' };
  }

  if (context.senderAddress && recipient === context.senderAddress) {
    return { valid: false, error: 'SELF_TRANSFER' };
  }

  const parsedAmount = Number(amountStr);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { valid: false, error: 'NON_POSITIVE_AMOUNT' };
  }

  const maxDecimals = context.maxDecimals ?? 7;
  const decimalPart = amountStr.split('.')[1];
  if (decimalPart && decimalPart.length > maxDecimals) {
    return { valid: false, error: 'PRECISION_OVERFLOW' };
  }

  if (parsedAmount > context.availableBalance) {
    return { valid: false, error: 'INSUFFICIENT_BALANCE' };
  }

  return { valid: true, parsedAmount };
}

export const TRANSFER_ERROR_MESSAGES: Record<TransferValidationErrorCode, string> = {
  MISSING_FIELDS: 'Fill all fields',
  INVALID_ADDRESS: 'Recipient does not look like a valid Stellar address.',
  SELF_TRANSFER: 'You cannot transfer to your own connected wallet.',
  NON_POSITIVE_AMOUNT: 'Enter a valid amount.',
  INSUFFICIENT_BALANCE: 'Amount exceeds your available balance.',
  PRECISION_OVERFLOW: 'Too many decimal places for this asset.',
};