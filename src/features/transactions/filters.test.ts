import { describe, expect, it } from 'vitest';
import { applyTransactionFilters } from './filters';
import { transactionHistoryFixtures } from './fixtures';

describe('applyTransactionFilters', () => {
  it('filters by operation and status together', () => {
    const records = applyTransactionFilters(transactionHistoryFixtures, {
      query: '',
      operations: ['transfer'],
      statuses: ['success'],
    });

    expect(records.length).toBe(1);
    expect(records[0].operation).toBe('transfer');
    expect(records[0].status).toBe('success');
  });

  it('filters by free-text query across actor/target/hash/asset', () => {
    const records = applyTransactionFilters(transactionHistoryFixtures, {
      query: 'ust-6m',
      operations: [],
      statuses: [],
    });

    expect(records.length).toBeGreaterThan(0);
    expect(records.every((record) => record.assetTicker?.toLowerCase() === 'ust-6m')).toBe(true);
  });
});
