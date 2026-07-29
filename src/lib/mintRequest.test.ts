import { describe, it, expect } from 'vitest';
import {
  validateMintRequest,
  DEFAULT_MINT_MAX_AMOUNT,
  isPlausibleStellarAddress,
} from './mintRequest';

const recipientAddress = 'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3';

const baseInput = {
  recipient: recipientAddress,
  amount: '1000',
  assetId: 'ny-cre',
};

const context = { maxDecimals: 2 };

describe('isPlausibleStellarAddress (mintRequest re-export)', () => {
  it('accepts a well-formed address', () => {
    expect(isPlausibleStellarAddress(recipientAddress)).toBe(true);
  });
});

describe('validateMintRequest', () => {
  it('accepts a well-formed mint request', () => {
    const result = validateMintRequest(baseInput, context);
    expect(result).toEqual({ valid: true, parsedAmount: 1000 });
  });

  it('rejects missing fields', () => {
    expect(validateMintRequest({ recipient: '', amount: '', assetId: '' }, context)).toEqual({
      valid: false,
      error: 'MISSING_FIELDS',
    });
    expect(
      validateMintRequest({ ...baseInput, assetId: '' }, context).error,
    ).toBe('MISSING_FIELDS');
  });

  it('rejects an invalid address', () => {
    const result = validateMintRequest(
      { ...baseInput, recipient: 'not-an-address' },
      context,
    );
    expect(result.error).toBe('INVALID_ADDRESS');
  });

  it('trims whitespace around the recipient and amount', () => {
    const result = validateMintRequest(
      {
        recipient: `  ${recipientAddress}  `,
        amount: '  50.5  ',
        assetId: 'ny-cre',
      },
      context,
    );
    expect(result).toEqual({ valid: true, parsedAmount: 50.5 });
  });

  it('rejects zero and negative amounts', () => {
    expect(validateMintRequest({ ...baseInput, amount: '0' }, context).error).toBe(
      'NON_POSITIVE_AMOUNT',
    );
    expect(validateMintRequest({ ...baseInput, amount: '-5' }, context).error).toBe(
      'NON_POSITIVE_AMOUNT',
    );
  });

  it('rejects decimal precision beyond the asset max', () => {
    const result = validateMintRequest(
      { ...baseInput, amount: '1.123' },
      context,
    );
    expect(result.error).toBe('PRECISION_OVERFLOW');
  });

  it('defaults to 7 max decimals when the asset does not specify one', () => {
    const result = validateMintRequest(
      { ...baseInput, amount: '1.1234567' },
      {},
    );
    expect(result.valid).toBe(true);
  });

  it('rejects amounts above the soft cap', () => {
    const result = validateMintRequest(
      { ...baseInput, amount: String(DEFAULT_MINT_MAX_AMOUNT + 1) },
      context,
    );
    expect(result.error).toBe('AMOUNT_TOO_LARGE');
  });

  it('respects a custom maxAmount', () => {
    const result = validateMintRequest(baseInput, { ...context, maxAmount: 500 });
    expect(result.error).toBe('AMOUNT_TOO_LARGE');
  });
});
