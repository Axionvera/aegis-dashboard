/**
 * Tests for useTableFilters pure utilities.
 *
 * These tests cover the framework-agnostic filter/sort/search logic.
 * The React hook itself is tested indirectly through component integration
 * tests in BulkComplianceReview and IssuanceRequestsTable.
 */
import { describe, it, expect } from 'vitest';
import {
  applyQuery,
  applySort,
  applyFilters,
  applyAllFilters,
  cycleSort,
  DEFAULT_TABLE_FILTER_STATE,
  type SortState,
  type TableFilterState,
} from '@/hooks/useTableFilters';

interface TestRecord {
  id: string;
  name: string;
  status: string;
  severity: string;
  amount: number;
}

const records: TestRecord[] = [
  { id: 'a1', name: 'Alice', status: 'approved', severity: 'low', amount: 100 },
  { id: 'b2', name: 'Bob', status: 'pending', severity: 'high', amount: 250 },
  { id: 'c3', name: 'Charlie', status: 'rejected', severity: 'critical', amount: 75 },
  { id: 'd4', name: 'alex', status: 'approved', severity: 'medium', amount: 300 },
];

/* ── applyQuery ── */

describe('applyQuery', () => {
  it('returns all records when query is empty', () => {
    expect(applyQuery(records, '', ['name'])).toHaveLength(4);
  });

  it('filters by case-insensitive text match', () => {
    const result = applyQuery(records, 'alice', ['name']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('matches partial text', () => {
    const result = applyQuery(records, 'ali', ['name']);
    expect(result).toHaveLength(1);
  });

  it('matches across multiple search fields', () => {
    const result = applyQuery(records, 'a1', ['id', 'name']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('returns empty array when no match', () => {
    expect(applyQuery(records, 'zzz', ['name'])).toHaveLength(0);
  });

  it('handles null/undefined field values gracefully', () => {
    const recordsWithNull = [
      ...records,
      { id: 'e5', name: null as unknown as string, status: 'draft', severity: 'low', amount: 0 },
    ];
    // Should not throw
    const result = applyQuery(recordsWithNull, 'e5', ['name', 'id']);
    expect(result).toHaveLength(1);
  });
});

/* ── applySort ── */

describe('applySort', () => {
  it('returns records unchanged when direction is null', () => {
    const sort: SortState = { field: '', direction: null };
    const result = applySort(records, sort);
    expect(result).toEqual(records);
  });

  it('sorts ascending by string field', () => {
    const sort: SortState = { field: 'name', direction: 'asc' };
    const result = applySort(records, sort);
    expect(result.map((r) => r.name)).toEqual(['alex', 'Alice', 'Bob', 'Charlie']);
  });

  it('sorts descending by string field', () => {
    const sort: SortState = { field: 'name', direction: 'desc' };
    const result = applySort(records, sort);
    expect(result.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'Alice', 'alex']);
  });

  it('sorts ascending by numeric field', () => {
    const sort: SortState = { field: 'amount', direction: 'asc' };
    const result = applySort(records, sort);
    expect(result.map((r) => r.amount)).toEqual([75, 100, 250, 300]);
  });

  it('does not mutate original array', () => {
    const sort: SortState = { field: 'amount', direction: 'desc' };
    const original = [...records];
    applySort(records, sort);
    expect(records).toEqual(original);
  });
});

/* ── applyFilters ── */

describe('applyFilters', () => {
  it('returns all records when no filters are set', () => {
    expect(applyFilters(records, {})).toHaveLength(4);
    expect(applyFilters(records, { status: [] })).toHaveLength(4);
  });

  it('filters by a single value', () => {
    const result = applyFilters(records, { status: ['approved'] });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['a1', 'd4']);
  });

  it('filters by multiple values (OR within a key)', () => {
    const result = applyFilters(records, { status: ['approved', 'pending'] });
    expect(result).toHaveLength(3);
  });

  it('combines multiple filter keys (AND across keys)', () => {
    const result = applyFilters(records, {
      status: ['approved'],
      severity: ['low'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('returns empty when no records match', () => {
    expect(applyFilters(records, { status: ['nonexistent'] })).toHaveLength(0);
  });
});

/* ── applyAllFilters ── */

describe('applyAllFilters', () => {
  it('combines query, filters, and sort', () => {
    const state: TableFilterState = {
      query: 'a',
      filters: { status: ['approved'] },
      sort: { field: 'amount', direction: 'desc' },
    };
    const result = applyAllFilters(records, state, ['name']);
    // Should match "Alice" and "alex" (both contain 'a'), approved only, sorted by amount desc
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('d4'); // amount 300
    expect(result[1].id).toBe('a1'); // amount 100
  });
});

/* ── cycleSort ── */

describe('cycleSort', () => {
  it('sets asc when clicking a new field', () => {
    const result = cycleSort({ field: '', direction: null }, 'name');
    expect(result).toEqual({ field: 'name', direction: 'asc' });
  });

  it('cycles to desc on same field', () => {
    const result = cycleSort({ field: 'name', direction: 'asc' }, 'name');
    expect(result).toEqual({ field: 'name', direction: 'desc' });
  });

  it('cycles to null on same field when already desc', () => {
    const result = cycleSort({ field: 'name', direction: 'desc' }, 'name');
    expect(result).toEqual({ field: '', direction: null });
  });

  it('switches to new field in asc', () => {
    const result = cycleSort({ field: 'status', direction: 'desc' }, 'name');
    expect(result).toEqual({ field: 'name', direction: 'asc' });
  });
});
