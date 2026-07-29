import { describe, it, expect } from 'vitest';
import { validateTransferRequest, isPlausibleStellarAddress } from './transferRequest';

const senderAddress = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
const recipientAddress = 'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3';

const context = { senderAddress, availableBalance: 100, maxDecimals: 2 };

describe('isPlausibleStellarAddress', () => {
  it('accepts a well-formed address', () => {
    expect(isPlausibleStellarAddress(recipientAddress)).toBe(true);
  });

  it('rejects addresses not starting with G', () => {
    expect(isPlausibleStellarAddress('X' + 'A'.repeat(55))).toBe(false);
  });

  it('rejects wrong-length addresses', () => {
    expect(isPlausibleStellarAddress('GABC')).toBe(false);
  });
});

describe('validateTransferRequest', () => {
  it('rejects missing fields', () => {
    const result = validateTransferRequest({ recipient: '', amount: '' }, context);
    expect(result).toEqual({ valid: false, error: 'MISSING_FIELDS' });
  });

  it('rejects an invalid address', () => {
    const result = validateTransferRequest(
      { recipient: 'not-an-address', amount: '10' },
      context
    );
    expect(result.error).toBe('INVALID_ADDRESS');
  });

  it('rejects self-transfer', () => {
    const result = validateTransferRequest({ recipient: senderAddress, amount: '10' }, context);
    expect(result.error).toBe('SELF_TRANSFER');
  });

  it('allows self-transfer check to be skipped when sender is unknown', () => {
    const result = validateTransferRequest(
      { recipient: senderAddress, amount: '10' },
      { ...context, senderAddress: null }
    );
    expect(result.valid).toBe(true);
  });

  it('rejects zero and negative amounts', () => {
    expect(
      validateTransferRequest({ recipient: recipientAddress, amount: '0' }, context).error
    ).toBe('NON_POSITIVE_AMOUNT');
    expect(
      validateTransferRequest({ recipient: recipientAddress, amount: '-5' }, context).error
    ).toBe('NON_POSITIVE_AMOUNT');
  });

  it('rejects amounts exceeding balance', () => {
    const result = validateTransferRequest(
      { recipient: recipientAddress, amount: '999' },
      context
    );
    expect(result.error).toBe('INSUFFICIENT_BALANCE');
  });

  it('rejects decimal precision beyond the asset max', () => {
    const result = validateTransferRequest(
      { recipient: recipientAddress, amount: '1.123' },
      context // maxDecimals: 2
    );
    expect(result.error).toBe('PRECISION_OVERFLOW');
  });

  it('defaults to 7 max decimals when the asset does not specify one', () => {
    const { maxDecimals: _omit, ...rest } = context;
    void _omit;
    const result = validateTransferRequest(
      { recipient: recipientAddress, amount: '1.1234567' },
      rest
    );
    expect(result.valid).toBe(true);
  });

  it('accepts a valid request', () => {
    const result = validateTransferRequest({ recipient: recipientAddress, amount: '10.5' }, context);
    expect(result).toEqual({ valid: true, parsedAmount: 10.5 });
  });
});