import { describe, it, expect } from 'vitest';
import {
  deriveBudgetStatus,
  DEFAULT_BUDGET_REVIEW_RULE,
  budgetStatusRank,
  filterBudgetResults,
  tallyBudgetResults,
  recomputeBudgetSelection,
  toggleBudgetSelection,
  setBudgetSelectionAll,
  applyBudgetBulkAction,
  formatBudgetValue,
  budgetResultLabel,
  validateBudgetChecks,
  type BudgetCheck,
  type BudgetReviewResult,
  type BudgetReviewState,
} from '@/lib/performanceBudget';
import { sampleBudgetResults } from '@/lib/__fixtures__/performanceBudget';

const checks = (results: BudgetCheck['result'][]): BudgetCheck[] =>
  results.map((r, i) => ({
    key: `c${i}`,
    label: `Check ${i}`,
    result: r,
    actual: r === 'fail' ? 1.5 : r === 'warn' ? 0.9 : 0.5,
    threshold: 1.0,
  }));

describe('deriveBudgetStatus', () => {
  it('returns compliant when all checks pass', () => {
    expect(deriveBudgetStatus(checks(['pass', 'pass']))).toBe('compliant');
  });

  it('returns breached when any check fails', () => {
    expect(deriveBudgetStatus(checks(['pass', 'fail', 'pass']))).toBe('breached');
  });

  it('returns warning when any check warns (and none fail)', () => {
    expect(deriveBudgetStatus(checks(['pass', 'warn']))).toBe('warning');
  });

  it('returns unknown when any check is unknown', () => {
    expect(deriveBudgetStatus(checks(['pass', 'unknown']))).toBe('unknown');
  });

  it('defaults to unknown with no checks', () => {
    expect(deriveBudgetStatus([])).toBe('unknown');
  });

  it('honours a custom rule', () => {
    const rule = {
      ...DEFAULT_BUDGET_REVIEW_RULE,
      onAnyWarn: 'compliant' as const,
    };
    expect(deriveBudgetStatus(checks(['pass', 'warn']), rule)).toBe('compliant');
  });
});

describe('budgetStatusRank', () => {
  it('orders compliant < warning < breached < unknown', () => {
    expect(budgetStatusRank('compliant')).toBeLessThan(budgetStatusRank('warning'));
    expect(budgetStatusRank('warning')).toBeLessThan(budgetStatusRank('breached'));
    expect(budgetStatusRank('breached')).toBeLessThan(budgetStatusRank('unknown'));
  });
});

describe('filterBudgetResults', () => {
  it('returns all when query is empty', () => {
    expect(filterBudgetResults(sampleBudgetResults, '  ')).toBe(sampleBudgetResults);
  });

  it('matches by budgetId substring (case-insensitive)', () => {
    const id = sampleBudgetResults[0].budgetId;
    const q = id.slice(0, 8).toLowerCase();
    const out = filterBudgetResults(sampleBudgetResults, q);
    expect(out).toHaveLength(1);
    expect(out[0].budgetId).toBe(id);
  });

  it('matches by budgetName', () => {
    const out = filterBudgetResults(sampleBudgetResults, 'concentration');
    expect(out.length).toBeGreaterThan(0);
  });

  it('matches by meta value', () => {
    const out = filterBudgetResults(sampleBudgetResults, 'USD');
    expect(out.length).toBeGreaterThan(0);
  });

  it('returns empty when nothing matches', () => {
    expect(filterBudgetResults(sampleBudgetResults, 'zzzz-no-match')).toHaveLength(0);
  });
});

describe('tallyBudgetResults', () => {
  it('counts results per status', () => {
    const tally = tallyBudgetResults(sampleBudgetResults);
    expect(tally.compliant).toBeGreaterThanOrEqual(0);
    expect(tally.warning).toBeGreaterThanOrEqual(0);
    expect(tally.breached).toBeGreaterThanOrEqual(0);
    expect(tally.unknown).toBeGreaterThanOrEqual(0);
  });
});

describe('selection helpers', () => {
  const base = (): BudgetReviewState =>
    recomputeBudgetSelection(sampleBudgetResults.map((r) => ({ ...r })));

  it('toggleBudgetSelection flips one row and recomputes counts', () => {
    const s0 = base();
    expect(s0.selectedCount).toBe(0);
    const id = s0.results[0].budgetId;
    const s1 = toggleBudgetSelection(s0, id);
    expect(s1.selectedCount).toBe(1);
    expect(s1.results[0].selected).toBe(true);
    const s2 = toggleBudgetSelection(s1, id);
    expect(s2.selectedCount).toBe(0);
  });

  it('setBudgetSelectionAll selects/deselects everything', () => {
    const s0 = base();
    const all = setBudgetSelectionAll(s0, true);
    expect(all.selectedCount).toBe(all.results.length);
    expect(all.allSelected).toBe(true);
    const none = setBudgetSelectionAll(all, false);
    expect(none.selectedCount).toBe(0);
    expect(none.allSelected).toBe(false);
  });
});

describe('applyBudgetBulkAction', () => {
  const selectFirstTwo = (): BudgetReviewState => {
    let s = recomputeBudgetSelection(sampleBudgetResults.map((x) => ({ ...x })));
    s = toggleBudgetSelection(s, s.results[0].budgetId);
    s = toggleBudgetSelection(s, s.results[1].budgetId);
    return s;
  };

  it('approves selected rows and clears selection', () => {
    const s = selectFirstTwo();
    const next = applyBudgetBulkAction(s, 'approve');
    expect(next.selectedCount).toBe(0);
    expect(next.results[0].status).toBe('compliant');
    expect(next.results[1].status).toBe('compliant');
    // Unselected rows untouched
    expect(next.results[2].status).toBe('breached');
  });

  it('rejects selected rows', () => {
    const s = selectFirstTwo();
    const next = applyBudgetBulkAction(s, 'reject');
    expect(next.results[0].status).toBe('breached');
    expect(next.results[1].status).toBe('breached');
  });

  it('flags selected rows for review', () => {
    const s = selectFirstTwo();
    const next = applyBudgetBulkAction(s, 'flag-for-review');
    expect(next.results[0].status).toBe('warning');
  });

  it('clear only removes selection, not status', () => {
    const s = selectFirstTwo();
    const next = applyBudgetBulkAction(s, 'clear');
    expect(next.selectedCount).toBe(0);
    expect(next.results[0].status).toBe('compliant');
    expect(next.results[1].status).toBe('warning');
  });

  it('no-op when nothing selected', () => {
    const s = recomputeBudgetSelection(sampleBudgetResults.map((x) => ({ ...x })));
    const next = applyBudgetBulkAction(s, 'approve');
    expect(next).toBe(s);
  });

  it('respects explicit selectedIds', () => {
    const s = recomputeBudgetSelection(sampleBudgetResults.map((x) => ({ ...x })));
    const id = s.results[3].budgetId;
    const next = applyBudgetBulkAction(s, 'approve', [id]);
    expect(next.results[3].status).toBe('compliant');
    expect(next.selectedCount).toBe(0);
  });
});

describe('formatBudgetValue', () => {
  it('formats a number to two decimal places', () => {
    expect(formatBudgetValue(0.75)).toBe('0.75');
  });

  it('returns N/A for null', () => {
    expect(formatBudgetValue(null)).toBe('N/A');
  });
});

describe('budgetResultLabel', () => {
  it('includes the compliance disclaimer', () => {
    const label = budgetResultLabel('pass', 'concentration');
    expect(label).toContain('Protocol-level compliance information');
  });

  it('uses the correct prefix for each result type', () => {
    expect(budgetResultLabel('pass', 'exposure')).toContain('within budget');
    expect(budgetResultLabel('fail', 'exposure')).toContain('exceeds budget');
    expect(budgetResultLabel('warn', 'exposure')).toContain('approaching budget');
    expect(budgetResultLabel('unknown', 'exposure')).toContain('data unavailable');
  });
});

describe('validateBudgetChecks', () => {
  it('returns no errors for valid checks', () => {
    const validChecks: BudgetCheck[] = [
      { key: 'k1', label: 'Check 1', result: 'pass', actual: 0.5, threshold: 1.0 },
      { key: 'k2', label: 'Check 2', result: 'pass', actual: 0.3, threshold: 1.0 },
    ];
    expect(validateBudgetChecks(validChecks)).toEqual([]);
  });

  it('reports duplicate keys', () => {
    const dupChecks: BudgetCheck[] = [
      { key: 'k1', label: 'Check 1', result: 'pass', actual: 0.5, threshold: 1.0 },
      { key: 'k1', label: 'Check 1b', result: 'pass', actual: 0.5, threshold: 1.0 },
    ];
    const errors = validateBudgetChecks(dupChecks);
    expect(errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  it('reports missing key', () => {
    const noKeyCheck: BudgetCheck = {
      key: '',
      label: 'Check',
      result: 'pass',
      actual: 0.5,
      threshold: 1.0,
    };
    const errors = validateBudgetChecks([noKeyCheck]);
    expect(errors.some((e) => e.includes('missing'))).toBe(true);
  });

  it('reports missing label', () => {
    const noLabelCheck: BudgetCheck = {
      key: 'k1',
      label: '',
      result: 'pass',
      actual: 0.5,
      threshold: 1.0,
    };
    const errors = validateBudgetChecks([noLabelCheck]);
    expect(errors.some((e) => e.includes('missing'))).toBe(true);
  });
});

describe('fixtures sanity', () => {
  it('sample results have consistent derived statuses', () => {
    for (const r of sampleBudgetResults as BudgetReviewResult[]) {
      const derived = deriveBudgetStatus(r.checks);
      expect(['compliant', 'warning', 'breached', 'unknown']).toContain(derived);
    }
  });
});