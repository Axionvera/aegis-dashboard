/**
 * RWA Asset Creation Request — data model & validation. (Issue #29)
 *
 * Pure module with no React or SDK imports so it can be unit-tested in
 * isolation and reused by the Issuer Console wizard or any future surface
 * that submits a new asset issuance request for compliance review.
 *
 * Scope note: this validates and shapes a *request to create* a new RWA
 * asset (an issuance request awaiting compliance review, landing in the
 * Issuer Console table). It is distinct from minting existing supply to a
 * recipient, which is handled by mintRequest.ts / MintWorkflow (Issue #6).
 * A created asset only becomes mintable once approved through that
 * separate, already-shipped review process.
 */

export type AssetCreationErrorCode =
  | 'MISSING_FIELDS'
  | 'ASSET_NAME_TOO_SHORT'
  | 'INVALID_TICKER'
  | 'DUPLICATE_TICKER'
  | 'NON_POSITIVE_AMOUNT'
  | 'AMOUNT_TOO_LARGE'
  | 'UNSUPPORTED_JURISDICTION';

export interface AssetCreationInput {
  assetName: string;
  ticker: string;
  /** Initial requested supply, as typed in the form. */
  amount: string;
  jurisdiction: string;
  assetClass: string;
}

export interface AssetCreationContext {
  /** Tickers already registered elsewhere in the system (case-insensitive). */
  existingTickers?: string[];
  /** Soft cap for a single issuance request (UI guard only). */
  maxAmount?: number;
}

export interface AssetCreationValidationResult {
  valid: boolean;
  error?: AssetCreationErrorCode;
  /** Parsed amount, only present when valid. */
  parsedAmount?: number;
  /** Normalised (uppercased, trimmed) ticker, only present when valid. */
  normalisedTicker?: string;
}

/**
 * Jurisdictions the mock compliance layer currently recognises. This is a
 * UI-level allow-list only — it does not represent real regulatory scope
 * and must not be presented to users as legal or compliance advice. See
 * docs/rwa-asset-creation-wizard.md.
 */
export const SUPPORTED_JURISDICTIONS = ['US', 'EU', 'SG', 'JP', 'AE', 'GB', 'CH'] as const;

export type SupportedJurisdiction = (typeof SUPPORTED_JURISDICTIONS)[number];

/** Asset classes offered in the creation wizard, aligned with existing catalogue entries. */
export const ASSET_CLASS_OPTIONS = [
  'Real Estate',
  'Fixed Income',
  'Private Equity',
  'Infrastructure',
] as const;

/**
 * Ticker shape: 2-10 uppercase letters/digits, optionally split by a single
 * hyphen into two such segments (e.g. NY-CRE, UST-6M, SGPCN).
 */
const TICKER_PATTERN = /^[A-Z0-9]{2,10}(-[A-Z0-9]{2,10})?$/;

/** Default soft cap for a single issuance request (UI guard only). */
export const DEFAULT_ASSET_CREATION_MAX_AMOUNT = 1_000_000_000;

export function validateAssetCreationRequest(
  input: AssetCreationInput,
  context: AssetCreationContext = {},
): AssetCreationValidationResult {
  const assetName = input.assetName.trim();
  const ticker = input.ticker.trim().toUpperCase();
  const amountStr = input.amount.trim();
  const jurisdiction = input.jurisdiction.trim().toUpperCase();
  const assetClass = input.assetClass.trim();

  if (!assetName || !ticker || !amountStr || !jurisdiction || !assetClass) {
    return { valid: false, error: 'MISSING_FIELDS' };
  }

  if (assetName.length < 3) {
    return { valid: false, error: 'ASSET_NAME_TOO_SHORT' };
  }

  if (!TICKER_PATTERN.test(ticker)) {
    return { valid: false, error: 'INVALID_TICKER' };
  }

  const existing = context.existingTickers?.map((t) => t.trim().toUpperCase()) ?? [];
  if (existing.includes(ticker)) {
    return { valid: false, error: 'DUPLICATE_TICKER' };
  }

  if (!SUPPORTED_JURISDICTIONS.includes(jurisdiction as SupportedJurisdiction)) {
    return { valid: false, error: 'UNSUPPORTED_JURISDICTION' };
  }

  const parsedAmount = Number(amountStr);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { valid: false, error: 'NON_POSITIVE_AMOUNT' };
  }

  const maxAmount = context.maxAmount ?? DEFAULT_ASSET_CREATION_MAX_AMOUNT;
  if (parsedAmount > maxAmount) {
    return { valid: false, error: 'AMOUNT_TOO_LARGE' };
  }

  return { valid: true, parsedAmount, normalisedTicker: ticker };
}

export const ASSET_CREATION_ERROR_MESSAGES: Record<AssetCreationErrorCode, string> = {
  MISSING_FIELDS: 'Fill in every field before continuing.',
  ASSET_NAME_TOO_SHORT: 'Asset name must be at least 3 characters.',
  INVALID_TICKER: 'Ticker must be 2-10 letters/numbers, e.g. NY-CRE or UST-6M.',
  DUPLICATE_TICKER: 'An asset with this ticker already exists.',
  NON_POSITIVE_AMOUNT: 'Enter an initial requested supply greater than zero.',
  AMOUNT_TOO_LARGE: 'Amount exceeds the maximum allowed for a single issuance request.',
  UNSUPPORTED_JURISDICTION: 'This jurisdiction is not yet supported for issuance requests.',
};