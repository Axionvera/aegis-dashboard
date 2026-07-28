import { describe, expect, it } from 'vitest';
import { normalizeTransactionRecord } from './normalize';

describe('normalizeTransactionRecord', () => {
  it('normalizes sdk receipt records', () => {
    const normalized = normalizeTransactionRecord({
      kind: 'sdk_receipt',
      txHash: 'tx123',
      successful: true,
      signer: 'actor-1',
      recipient: 'target-1',
      createdAt: '2026-07-28T08:00:00.000Z',
      action: 'transfer',
      amount: 12.5,
      assetTicker: 'NY-CRE',
    });

    expect(normalized.status).toBe('success');
    expect(normalized.operation).toBe('transfer');
    expect(normalized.hash).toBe('tx123');
    expect(normalized.actor).toBe('actor-1');
    expect(normalized.target).toBe('target-1');
  });

  it('maps contract event types to normalized operations', () => {
    const normalized = normalizeTransactionRecord({
      kind: 'contract_event',
      eventType: 'asset.registered',
      status: 'ok',
      actor: 'admin',
      target: 'asset:UST-6M',
      happenedAt: '2026-07-28T08:05:00.000Z',
    });

    expect(normalized.operation).toBe('asset_registration');
    expect(normalized.status).toBe('success');
  });

  it('normalizes placeholders with fallbacks', () => {
    const normalized = normalizeTransactionRecord({
      kind: 'placeholder',
      id: 'p-1',
      label: 'Missing hash and actor',
    });

    expect(normalized.hash).toBe('unavailable');
    expect(normalized.actor).toBe('unknown-actor');
    expect(normalized.operation).toBe('admin_action');
  });
});
