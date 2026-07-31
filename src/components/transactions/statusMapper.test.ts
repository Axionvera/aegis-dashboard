import { describe, expect, it } from 'vitest';
import { mapToTransactionResult } from './statusMapper';

describe('mapToTransactionResult', () => {
  it('maps successful RPC outcomes with a transaction hash', () => {
    expect(
      mapToTransactionResult({
        status: 'SUCCESS',
        hash: 'abc123',
      }),
    ).toMatchObject({
      status: 'success',
      txHash: 'abc123',
      message: 'Transaction confirmed',
    });
  });

  it('maps pending and unknown statuses', () => {
    expect(mapToTransactionResult({ status: 'PENDING', txHash: 'pending-hash' })).toMatchObject({
      status: 'pending',
      txHash: 'pending-hash',
      message: 'Transaction submitted',
    });

    expect(mapToTransactionResult({ status: 'not_a_real_status', hash: 'x' })).toMatchObject({
      status: 'unknown',
      txHash: 'x',
      message: 'Transaction status unknown',
    });
  });

  it('treats thrown errors and error fields as failures', () => {
    expect(mapToTransactionResult(new Error('Wallet rejected'))).toMatchObject({
      status: 'failure',
      detail: 'Wallet rejected',
    });

    expect(
      mapToTransactionResult({
        status: 'SUCCESS',
        errorMessage: 'Recipient account is not authorised to hold this asset.',
      }),
    ).toMatchObject({
      status: 'failure',
      detail: 'Recipient account is not authorised to hold this asset.',
    });
  });

  it('maps bare status strings and nullish outcomes', () => {
    expect(mapToTransactionResult('CONFIRMED')).toMatchObject({ status: 'success' });
    expect(mapToTransactionResult(null)).toMatchObject({ status: 'unknown' });
  });
});
