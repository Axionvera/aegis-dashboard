/**
 * Admin RWA Mint Request — data model & validation. (Issue #6)
 *
 * Pure module with no React or SDK imports so it can be unit-tested in
 * isolation and reused by any surface that validates a mint before the
 * compliance pre-check, review screen, or SDK call.
 */

import { isPlausibleStellarAddress } from '@/lib/transferRequest';

export type MintValidationErrorCode =
  | 'MISSING_FIELDS'
  | 'INVALID_ADDRESS'
  | 'NON_POSITIVE_AMOUNT'
  | 'PRECISION_OVERFLOW'
  | 'AMOUNT_TOO_LARGE';

export interface MintRequestInput {
  recipient: string;
  amount: string;
  assetId: string;
}

export interface MintRequestContext {
  /** Max decimal places the selected asset supports. */
  maxDecimals?: number;
  /**
   * Optional soft cap for a single mint. Protocol-level supply limits remain
   * authoritative on-chain; this only blocks obviously oversized form input.
   */
  maxAmount?: number;
}

export interface MintValidationResult {
  valid: boolean;
  error?: MintValidationErrorCode;
  /** Parsed amount, only present when valid. */
  parsedAmount?: number;
}

/** Default soft cap for a single admin mint (UI guard only). */
export const DEFAULT_MINT_MAX_AMOUNT = 1_000_000_000;

export function validateMintRequest(
  input: MintRequestInput,
  context: MintRequestContext = {},
): MintValidationResult {
  const recipient = input.recipient.trim();
  const amountStr = input.amount.trim();
  const assetId = input.assetId.trim();

  if (!recipient || !amountStr || !assetId) {
    return { valid: false, error: 'MISSING_FIELDS' };
  }

  if (!isPlausibleStellarAddress(recipient)) {
    return { valid: false, error: 'INVALID_ADDRESS' };
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

  const maxAmount = context.maxAmount ?? DEFAULT_MINT_MAX_AMOUNT;
  if (parsedAmount > maxAmount) {
    return { valid: false, error: 'AMOUNT_TOO_LARGE' };
  }

  return { valid: true, parsedAmount };
}

export const MINT_ERROR_MESSAGES: Record<MintValidationErrorCode, string> = {
  MISSING_FIELDS: 'Select an asset and fill all fields.',
  INVALID_ADDRESS: 'Recipient does not look like a valid Stellar address.',
  NON_POSITIVE_AMOUNT: 'Enter a valid amount greater than zero.',
  PRECISION_OVERFLOW: 'Too many decimal places for this asset.',
  AMOUNT_TOO_LARGE: 'Amount exceeds the maximum allowed for a single mint.',
};

export { isPlausibleStellarAddress };
