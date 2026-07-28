/**
 * Metadata validation for issuer asset registration.
 *
 * All fields are validated client-side before the review step so that
 * issuers get immediate feedback.  Validation does NOT imply legal
 * verification of the underlying asset.
 */

export interface AssetMetadata {
  /** Human-readable name of the asset (e.g. "Manhattan Commercial Real Estate") */
  name: string;
  /** Short on-chain ticker symbol (e.g. "NY-CRE") */
  ticker: string;
  /** Category of the real-world asset */
  assetType: string;
  /** Total supply to issue (in base units) */
  totalSupply: string;
  /** IPFS CID or HTTPS URL pointing to the legal/descriptive document */
  documentUri: string;
  /** ISO-3166-1 alpha-2 country of jurisdiction (e.g. "US") */
  jurisdiction: string;
  /** Optional: free-text description shown to investors */
  description?: string;
}

export interface ValidationError {
  field: keyof AssetMetadata;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const TICKER_RE = /^[A-Z0-9\-]{2,12}$/;
const IPFS_RE = /^(ipfs:\/\/|https?:\/\/).+/i;
const ISO2_RE = /^[A-Z]{2}$/;

export function validateAssetMetadata(data: AssetMetadata): ValidationResult {
  const errors: ValidationError[] = [];

  // name
  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Asset name is required.' });
  } else if (data.name.trim().length > 80) {
    errors.push({ field: 'name', message: 'Asset name must be 80 characters or fewer.' });
  }

  // ticker
  if (!data.ticker.trim()) {
    errors.push({ field: 'ticker', message: 'Ticker symbol is required.' });
  } else if (!TICKER_RE.test(data.ticker.trim())) {
    errors.push({
      field: 'ticker',
      message: 'Ticker must be 2-12 uppercase letters, digits, or hyphens.',
    });
  }

  // assetType
  if (!data.assetType.trim()) {
    errors.push({ field: 'assetType', message: 'Asset type is required.' });
  }

  // totalSupply
  const supply = Number(data.totalSupply);
  if (!data.totalSupply.trim()) {
    errors.push({ field: 'totalSupply', message: 'Total supply is required.' });
  } else if (isNaN(supply) || supply <= 0) {
    errors.push({ field: 'totalSupply', message: 'Total supply must be a positive number.' });
  } else if (!Number.isInteger(supply)) {
    errors.push({ field: 'totalSupply', message: 'Total supply must be a whole number.' });
  }

  // documentUri
  if (!data.documentUri.trim()) {
    errors.push({ field: 'documentUri', message: 'Document URI is required.' });
  } else if (!IPFS_RE.test(data.documentUri.trim())) {
    errors.push({
      field: 'documentUri',
      message: 'Document URI must start with ipfs://, http://, or https://.',
    });
  }

  // jurisdiction
  if (!data.jurisdiction.trim()) {
    errors.push({ field: 'jurisdiction', message: 'Jurisdiction is required.' });
  } else if (!ISO2_RE.test(data.jurisdiction.trim())) {
    errors.push({
      field: 'jurisdiction',
      message: 'Jurisdiction must be a 2-letter ISO-3166-1 alpha-2 country code (e.g. US).',
    });
  }

  // description (optional, but cap length)
  if (data.description && data.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be 500 characters or fewer.',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Returns the error message for a specific field, or undefined if the field
 * is valid.  Useful for inline form feedback.
 */
export function fieldError(
  errors: ValidationError[],
  field: keyof AssetMetadata
): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}
