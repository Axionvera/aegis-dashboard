# Bulk Compliance Review Table

This document describes the bulk compliance review table for the Aegis Dashboard
(issue #26). It is part of the protocol's compliance control surface and is
designed to be safe, typed, testable, and contributor-friendly.

> **Disclaimer:** This implements *protocol-level* compliance mechanics only. It
> is **not** legal, regulatory, or financial advice, and does not determine
> whether any specific investor is permitted to hold an RWA token under
> applicable law.

## Data model

The table is driven by a typed, framework-agnostic core in
`src/lib/complianceReview.ts`:

- `ComplianceSubject` — one row. Carries an `id` (typically a Stellar
  address), a `status`, a `severity`, an ordered list of `ComplianceCheck`s,
  and optional non-PII `meta` (e.g. jurisdiction code).
- `ComplianceCheck` — a single named check (`key`, `label`, `result`,
  optional `detail`/`evaluatedAt`). `result` is `pass | fail | warn |
  unknown`.
- `ComplianceReviewState` — the aggregate (rows + derived `selectedCount`
  and `allSelected`).

Functions are **pure** (no side effects, no mutation), so the review engine
can be unit-tested without a DOM and reused by the UI, SDK, or any future
boundary.

## Behaviour

- **Derived status** (`deriveStatus`) maps a subject's check results to a
  recommended status via a declarative `ReviewRule`:
  - any `fail` → `rejected`
  - any `unknown` → `pending`
  - any `warn` → `review`
  - all `pass` → `approved`
  - no checks → `pending`
- **Severity ranking** (`severityRank`) sorts the queue so the highest-risk
  subjects surface first (`critical > high > medium > low`).
- **Filtering** (`filterSubjects`) is a case-insensitive substring match over
  `id` and `meta` values — deliberately non-PII.
- **Bulk actions** (`applyBulkAction`) — `approve | reject | flag-for-review
  | clear` — operate only on selected rows and clear selection afterward
  (standard table UX). Selection counts are centralised via
  `recomputeSelection` so they can never drift out of sync.
- **Tally** (`tallyByStatus`) powers the summary chips.

## Edge cases & failure states

| Case | Behaviour |
| --- | --- |
| No checks on a subject | status defaults to `pending` (never silently `approved`) |
| All checks `pass` | status `approved` |
| Any check `fail` | status `rejected` (fail wins over warn/unknown) |
| Any check `unknown` | status `pending` (awaiting data, never assumed safe) |
| Any check `warn` | status `review` |
| No rows selected | bulk buttons disabled; `applyBulkAction` is a no-op |
| Empty filter query | returns all subjects |
| Filter matches nothing | table shows an empty-state message |

## Security & compliance assumptions

- **Fail-closed:** `unknown` and `fail` never resolve to `approved`. A
  subject is only approved when every check explicitly passes.
- **No PIII in the table:** only identifiers and reference codes (jurisdiction,
  tier) are stored; sensitive KYC documents live in the external identity
  provider, referenced by key.
- **Admin-gated UI:** bulk action controls render only when `canAct` is
  `true`; the page also requires a connected wallet. The authoritative
  enforcement remains on-chain (see `aegis-contracts` compliance module).
- **Deterministic, testable rules:** the `ReviewRule` is a plain object so
  behaviour can be unit-tested and reused across the ecosystem without
  divergence.

## Tests, fixtures & review checklist

- `src/lib/complianceReview.test.ts` — 21 unit tests covering status
  derivation, severity ranking, filtering, tally, selection, and every bulk
  action (including no-op and explicit-`selectedIds` paths).
- `src/lib/__fixtures__/complianceReview.ts` — a 4-row example queue
  exercising all four statuses and severities.
- Reviewer checklist:
  - [ ] Every check result is covered by a `ReviewRule` branch.
  - [ ] `unknown` never collapses to `approved`.
  - [ ] Bulk actions clear selection and preserve unselected rows.
  - [ ] No PIII is introduced into `meta` or `detail`.

## Compatibility

- Uses the repo's existing aliases (`@/*`), Tailwind brand classes
  (`bg-aegis-brand`, `text-aegis-accent`), and the `useWallet` connection
  gate — consistent with `pages/admin.tsx`.
- Exposed at the route `src/pages/compliance.tsx`, which loads the queue
  (currently the sample fixture; in production sourced from the SDK/contract
  layer) and renders `<BulkComplianceReview />`.
- The pure core has no React dependency, so the same logic can back an SDK
  helper or a different surface without duplication.
