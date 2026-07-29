import type { BudgetReviewResult } from '@/lib/performanceBudget';

/**
 * Example fixture representing a realistic performance budget review
 * queue for the Aegis Dashboard. Identifiers are illustrative — do NOT
 * treat as real accounts or real budget IDs. No PII is included.
 */
export const sampleBudgetResults: BudgetReviewResult[] = [
  {
    budgetId: 'budget-concentration-001',
    budgetName: 'Concentration Limit',
    status: 'compliant',
    meta: { currency: 'USD', portfolio: 'Core Portfolio' },
    checks: [
      {
        key: 'concentration_ratio',
        label: 'Concentration Ratio',
        result: 'pass',
        actual: 0.35,
        threshold: 0.5,
        detail: 'Single-asset exposure is within the 50% limit.',
        evaluatedAt: '2026-07-28T10:00:00Z',
      },
      {
        key: 'sector_diversification',
        label: 'Sector Diversification',
        result: 'pass',
        actual: 0.6,
        threshold: 0.8,
        detail: 'Portfolio spans 5 sectors; limit is 80% concentration.',
        evaluatedAt: '2026-07-28T10:00:00Z',
      },
    ],
  },
  {
    budgetId: 'budget-liquidity-001',
    budgetName: 'Liquidity Threshold',
    status: 'warning',
    meta: { currency: 'USD', portfolio: 'Core Portfolio' },
    checks: [
      {
        key: 'daily_liquidity_ratio',
        label: 'Daily Liquidity Ratio',
        result: 'warn',
        actual: 0.85,
        threshold: 0.8,
        detail: 'Liquidity buffer is close to the minimum threshold.',
        evaluatedAt: '2026-07-28T10:05:00Z',
      },
      {
        key: 'redemption_capacity',
        label: 'Redemption Capacity',
        result: 'pass',
        actual: 0.95,
        threshold: 0.9,
        detail: 'Sufficient capacity to cover projected redemptions.',
        evaluatedAt: '2026-07-28T10:05:00Z',
      },
    ],
  },
  {
    budgetId: 'budget-exposure-001',
    budgetName: 'Jurisdiction Exposure Limit',
    status: 'breached',
    meta: { currency: 'USD', portfolio: 'Global Portfolio' },
    checks: [
      {
        key: 'us_exposure',
        label: 'US Exposure',
        result: 'pass',
        actual: 0.4,
        threshold: 0.5,
        detail: 'US assets are within the 50% cap.',
        evaluatedAt: '2026-07-28T10:10:00Z',
      },
      {
        key: 'eu_exposure',
        label: 'EU Exposure',
        result: 'fail',
        actual: 0.55,
        threshold: 0.4,
        detail: 'EU assets exceed the 40% regulatory cap.',
        evaluatedAt: '2026-07-28T10:10:00Z',
      },
    ],
  },
  {
    budgetId: 'budget-unknown-001',
    budgetName: 'Emerging Market Exposure',
    status: 'unknown',
    meta: { currency: 'USD', portfolio: 'Global Portfolio' },
    checks: [
      {
        key: 'em_exposure',
        label: 'Emerging Market Exposure',
        result: 'unknown',
        actual: null,
        threshold: 0.3,
        detail: 'Market data feed is temporarily unavailable.',
        evaluatedAt: '2026-07-28T10:15:00Z',
      },
    ],
  },
];