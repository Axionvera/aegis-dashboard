import { describe, expect, it } from 'vitest';
import { TRANSACTION_OPERATIONS } from './filters';
import { transactionHistoryFixtures } from './fixtures';

describe('transactionHistoryFixtures', () => {
  it('covers all major operation types', () => {
    const operations = new Set(transactionHistoryFixtures.map((record) => record.operation));
    TRANSACTION_OPERATIONS.forEach((operation) => {
      expect(operations.has(operation)).toBe(true);
    });
  });

  it('covers sdk, contract event, and placeholder sources', () => {
    const sources = new Set(transactionHistoryFixtures.map((record) => record.source));
    expect(sources.has('sdk_receipt')).toBe(true);
    expect(sources.has('contract_event')).toBe(true);
    expect(sources.has('placeholder')).toBe(true);
  });

  it('includes failed and pending statuses', () => {
    const statuses = new Set(transactionHistoryFixtures.map((record) => record.status));
    expect(statuses.has('failed')).toBe(true);
    expect(statuses.has('pending')).toBe(true);
    expect(statuses.has('success')).toBe(true);
  });
});
