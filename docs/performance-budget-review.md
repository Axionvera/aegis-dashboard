# Performance Budget Review

Issue: [#44](https://github.com/Axionvera/aegis-dashboard/issues/44)

> **Disclaimer:** This document describes the protocol-level performance budget review mechanics in the Aegis Dashboard. It is **not legal, regulatory, or financial advice**. The dashboard implements protocol-level budget threshold evaluation only; it does not determine whether a portfolio or asset is suitable for any particular investor. All compliance and investment decisions must be made by qualified personnel in accordance with applicable laws and regulations.

## Overview

The Performance Budget Review feature provides a typed, testable workflow for evaluating portfolio assets against configurable performance budgets. Budgets define thresholds for metrics such as concentration ratio, liquidity, and jurisdiction exposure. The review engine evaluates each metric against its threshold and produces a status (`compliant`, `warning`, `breached`, or `unknown`) that the dashboard can render.

This feature is designed to be safe for RWA/compliance use cases and consistent with the SDK, dashboard, and contract boundaries.

## Data Model

The review engine is framework-agnostic and lives in `src/lib/performanceBudget.ts`:

| Type | Purpose |
|---|---|
| `BudgetCheck` | A single metric evaluated against a threshold (`key`, `label`, `result`, `actual`, `threshold`, `detail?`) |
| `BudgetReviewResult` | The outcome of running all checks for one budget on one subject |
| `BudgetReviewState` | Aggregate state (results + derived `selectedCount`/`allSelected`) |
| `BudgetReviewRule` | Declarative rule mapping check results to a recommended status |
| `BudgetBulkAction` | `approve \| reject \| flag-for-review \| clear` |

### BudgetCheck fields

- `key` — Stable machine key (e.g. `concentration_ratio`).
- `label` — Human-readable label shown in the table.
- `result` — `pass | fail | warn | unknown`.
- `actual` — The measured value, or `null` when unavailable.
- `threshold` — The threshold the metric was compared against.
- `detail?` — Optional free-form explanation (no PII).
- `evaluatedAt?` — ISO 8601 timestamp of last evaluation.

### BudgetReviewResult fields

- `budgetId` — Stable machine key for the budget.
- `budgetName` — Human-readable budget name.
- `status` — `compliant | warning | breached | unknown`.
- `checks` — Ordered list of `BudgetCheck` results.
- `selected?` — Whether the row is selected for bulk action.
- `meta?` — Arbitrary non-PII metadata (e.g. portfolio name, currency).

## Behaviour

### Status derivation

`deriveBudgetStatus` maps a set of check results to a recommended status via a declarative `BudgetReviewRule`:

| Condition | Status |
|---|---|
| Any check `fail` | `breached` |
| Any check `unknown` (and no fails) | `unknown` |
| Any check `warn` (and no fails/unknowns) | `warning` |
| All checks `pass` | `compliant` |
| No checks | `unknown` |

The default rule (`DEFAULT_BUDGET_REVIEW_RULE`) is fail-closed: `fail` and `unknown` never resolve to `compliant`. A budget is only compliant when every check explicitly passes.

### Severity ranking

`budgetStatusRank` orders statuses so the highest-risk items surface first (`breached > warning > unknown > compliant`).

### Filtering

`filterBudgetResults` is a case-insensitive substring match over `budgetId`, `budgetName`, and `meta` values — deliberately non-PII.

### Bulk actions

`applyBudgetBulkAction` — `approve | reject | flag-for-review | clear` — operates only on selected rows and clears selection afterward (standard table UX). Selection counts are centralised via `recomputeBudgetSelection` so they can never drift out of sync.

### Tally

`tallyBudgetResults` powers the summary chips, counting results per status.

## Edge Cases & Failure States

| Case | Behaviour |
|---|---|
| No checks on a budget result | status defaults to `unknown` (never silently `compliant`) |
| All checks `pass` | status `compliant` |
| Any check `fail` | status `breached` (fail wins over warn/unknown) |
| Any check `unknown` | status `unknown` (awaiting data, never assumed safe) |
| Any check `warn` | status `warning` |
| No rows selected | bulk buttons disabled; `applyBudgetBulkAction` is a no-op |
| Empty filter query | returns all results |
| Filter matches nothing | table shows an empty-state message |
| `actual` is `null` | metric data unavailable; check result should be `unknown` |
| Duplicate check keys | `validateBudgetChecks` reports an error |
| Missing check key or label | `validateBudgetChecks` reports an error |

## Security & Compliance Assumptions

- **Fail-closed:** `unknown` and `fail` never resolve to `compliant`. A budget is only compliant when every check explicitly passes.
- **No PII in the table:** only identifiers and reference codes (portfolio name, currency) are stored; no sensitive financial data is kept in the client.
- **Admin-gated UI:** bulk action controls render only when `canAct` is `true`; the page also requires a connected wallet. The authoritative enforcement remains on-chain (see `aegis-contracts` compliance module).
- **Deterministic, testable rules:** the `BudgetReviewRule` is a plain object so behaviour can be unit-tested and reused across the ecosystem without divergence.
- **Protocol-level only:** budget review results reflect protocol-level threshold evaluation, not legal or financial determinations. The `COMPLIANCE_DISCLAIMER` must accompany all user-facing copy derived from this module.

## Tests, Fixtures & Review Checklist

### Tests

- `src/lib/performanceBudget.test.ts` — Unit tests covering:
  - Status derivation for all four outcomes (`compliant`, `warning`, `breached`, `unknown`)
  - Custom rule override
  - Severity ranking
  - Filtering by ID, name, and meta
  - Tally counts
  - Selection helpers (toggle, select all, recompute)
  - Bulk actions (approve, reject, flag, clear, no-op, explicit `selectedIds`)
  - Value formatting (`formatBudgetValue`)
  - Compliance-safe label generation (`budgetResultLabel`)
  - Check validation (`validateBudgetChecks`)
  - Fixture sanity (all derived statuses are valid)

### Fixtures

- `src/lib/__fixtures__/performanceBudget.ts` — A 4-row example queue exercising all four statuses and a mix of check results.

### Reviewer Checklist

- [ ] Every check result is covered by a `BudgetReviewRule` branch.
- [ ] `unknown` never collapses to `compliant`.
- [ ] Bulk actions clear selection and preserve unselected rows.
- [ ] No PII is introduced into `meta` or `detail`.
- [ ] `PerformanceBudgetPanel` shows `COMPLIANCE_DISCLAIMER` in the header.
- [ ] `validateBudgetChecks` catches duplicate keys and missing fields.
- [ ] Protocol-level budget review is never presented as legal or financial advice.

## Compatibility

- Uses the repo's existing aliases (`@/*`), Tailwind brand classes, and the `useWallet` connection gate — consistent with `pages/diagnostics.tsx`.
- Exposed via the `PerformanceBudgetPanel` component in `src/features/diagnostics/components/`.
- The pure core has no React dependency, so the same logic can back an SDK helper or a different surface without duplication.
- The `getPerformanceBudget` method is added to `IAegisProvider`, `MockAegisProvider`, and `LiveAegisProvider`, following the existing SDK abstraction pattern.
- The `performanceBudgetReview` feature flag controls whether the panel is surfaced in the diagnostics section.