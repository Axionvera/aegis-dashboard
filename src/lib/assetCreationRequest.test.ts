import { describe, it, expect } from 'vitest';
import {
  validateAssetCreationRequest,
  DEFAULT_ASSET_CREATION_MAX_AMOUNT,
  SUPPORTED_JURISDICTIONS,
} from './assetCreationRequest';

const baseInput = {
  assetName: 'Manhattan Commercial Real Estate',
  ticker: 'NY-CRE',
  amount: '100000',
  jurisdiction: 'US',
  assetClass: 'Real Estate',
};

describe('validateAssetCreationRequest', () => {
  it('accepts a well-formed asset creation request', () => {
    const result = validateAssetCreationRequest(baseInput);
    expect(result).toEqual({
      valid: true,
      parsedAmount: 100000,
      normalisedTicker: 'NY-CRE',
    });
  });

  it('normalises a lowercase ticker and jurisdiction', () => {
    const result = validateAssetCreationRequest({
      ...baseInput,
      ticker: 'ny-cre',
      jurisdiction: 'us',
    });
    expect(result.valid).toBe(true);
    expect(result.normalisedTicker).toBe('NY-CRE');
  });

  it('rejects missing fields', () => {
    expect(
      validateAssetCreationRequest({
        assetName: '',
        ticker: '',
        amount: '',
        jurisdiction: '',
        assetClass: '',
      }),
    ).toEqual({ valid: false, error: 'MISSING_FIELDS' });

    expect(
      validateAssetCreationRequest({ ...baseInput, assetClass: '' }).error,
    ).toBe('MISSING_FIELDS');
  });

  it('rejects an asset name that is too short', () => {
    expect(
      validateAssetCreationRequest({ ...baseInput, assetName: 'NY' }).error,
    ).toBe('ASSET_NAME_TOO_SHORT');
  });

  it('rejects a malformed ticker', () => {
    expect(validateAssetCreationRequest({ ...baseInput, ticker: 'n' }).error).toBe(
      'INVALID_TICKER',
    );
    expect(
      validateAssetCreationRequest({ ...baseInput, ticker: 'TOO-LONG-SEGMENT-HERE' }).error,
    ).toBe('INVALID_TICKER');
    expect(
      validateAssetCreationRequest({ ...baseInput, ticker: 'NY_CRE' }).error,
    ).toBe('INVALID_TICKER');
  });

  it('rejects a ticker that already exists (case-insensitive)', () => {
    const result = validateAssetCreationRequest(
      { ...baseInput, ticker: 'ny-cre' },
      { existingTickers: ['NY-CRE', 'UST-6M'] },
    );
    expect(result).toEqual({ valid: false, error: 'DUPLICATE_TICKER' });
  });

  it('rejects a non-positive amount', () => {
    expect(validateAssetCreationRequest({ ...baseInput, amount: '0' }).error).toBe(
      'NON_POSITIVE_AMOUNT',
    );
    expect(validateAssetCreationRequest({ ...baseInput, amount: '-5' }).error).toBe(
      'NON_POSITIVE_AMOUNT',
    );
    expect(validateAssetCreationRequest({ ...baseInput, amount: 'abc' }).error).toBe(
      'NON_POSITIVE_AMOUNT',
    );
  });

  it('rejects an amount above the default max', () => {
    const result = validateAssetCreationRequest({
      ...baseInput,
      amount: String(DEFAULT_ASSET_CREATION_MAX_AMOUNT + 1),
    });
    expect(result.error).toBe('AMOUNT_TOO_LARGE');
  });

  it('respects a custom max amount from context', () => {
    const result = validateAssetCreationRequest(
      { ...baseInput, amount: '500' },
      { maxAmount: 100 },
    );
    expect(result.error).toBe('AMOUNT_TOO_LARGE');
  });

  it('rejects an unsupported jurisdiction', () => {
    expect(
      validateAssetCreationRequest({ ...baseInput, jurisdiction: 'ZZ' }).error,
    ).toBe('UNSUPPORTED_JURISDICTION');
  });

  it('accepts every currently supported jurisdiction', () => {
    for (const jurisdiction of SUPPORTED_JURISDICTIONS) {
      expect(
        validateAssetCreationRequest({ ...baseInput, jurisdiction }).valid,
      ).toBe(true);
    }
  });
});