import { describe, expect, it } from 'vitest';
import {
  adminOperationReceiptFixtures,
  adminReceiptStateFixtures,
} from './fixtures';
import { mapAdminActionReceipt } from './mapAdminActionReceipt';

const TARGET =
  'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3';
const HASH =
  'b9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e';

describe('mapAdminActionReceipt', () => {
  it('normalizes SDK status, target, hash, explorer URL, and next action', () => {
    const receipt = mapAdminActionReceipt({
      operation: 'mint',
      target: TARGET,
      network: 'TESTNET',
      outcome: { status: 'SUCCESS', hash: HASH },
      metadata: { asset: 'NY-CRE', amount: '1,000.00 NY-CRE' },
    });

    expect(receipt.result).toMatchObject({
      status: 'success',
      txHash: HASH,
    });
    expect(receipt.details.rows).toEqual(
      expect.arrayContaining([
        { label: 'Operation', value: 'Mint' },
        { label: 'Target', value: TARGET, mono: true },
        { label: 'Asset', value: 'NY-CRE' },
        { label: 'Network', value: 'TESTNET' },
      ]),
    );
    expect(receipt.explorerUrl).toBe(
      `https://stellar.expert/explorer/testnet/tx/${HASH}`,
    );
    expect(receipt.nextAction.label).toBe('Mint another');
    expect(receipt.limitation).toBeUndefined();
  });

  it('explains when a provider returns no transaction hash', () => {
    const receipt = mapAdminActionReceipt({
      operation: 'whitelist-remove',
      target: TARGET,
      network: 'TESTNET',
      outcome: { status: 'FAILED', errorMessage: 'Not authorized' },
    });

    expect(receipt.result.status).toBe('failure');
    expect(receipt.explorerUrl).toBeNull();
    expect(receipt.nextAction.label).toBe('Review action');
    expect(receipt.limitation).toMatch(/did not return a transaction hash/i);
  });

  it('documents asset registration as local without chain evidence', () => {
    const receipt = mapAdminActionReceipt({
      operation: 'asset-registration',
      target: 'NY-CRE',
      outcome: { status: 'SUCCESS' },
      metadata: { requestId: 'ISS-005', asset: 'New York CRE (NY-CRE)' },
    });

    expect(receipt.result.status).toBe('success');
    expect(receipt.result.message).toBe('Request submitted');
    expect(receipt.explorerUrl).toBeNull();
    expect(receipt.limitation).toMatch(/local issuance request/i);
    expect(receipt.nextAction.label).toBe('Create another');
  });

  it('does not create an explorer link for unsupported networks', () => {
    const receipt = mapAdminActionReceipt({
      operation: 'role-change',
      target: TARGET,
      network: 'FUTURENET',
      outcome: { status: 'PENDING', hash: HASH },
      metadata: { role: 'Issuer' },
    });

    expect(receipt.result.status).toBe('pending');
    expect(receipt.explorerUrl).toBeNull();
    expect(receipt.limitation).toMatch(/not wired/i);
  });
});

describe('admin receipt fixtures', () => {
  it('covers all major admin operations', () => {
    expect(
      adminOperationReceiptFixtures.map((receipt) => receipt.operation),
    ).toEqual([
      'whitelist-add',
      'whitelist-remove',
      'asset-registration',
      'role-change',
      'mint',
    ]);
  });

  it('covers every receipt status', () => {
    expect(
      adminReceiptStateFixtures.map((receipt) => receipt.result.status),
    ).toEqual(['success', 'failure', 'pending', 'unknown']);
  });
});
