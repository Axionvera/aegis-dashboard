# Aegis SDK Minimum Testing Standard

> **Applies to:** Any change that touches compliance, KYC, RWA metadata,
> investor reads, admin actions, or transaction receipts — whether the code
> lives in `src/lib/sdk/`, `src/lib/aegis/`, or a feature that consumes the
> SDK output (`src/features/**`, `src/components/transactions/**`).

## Why this exists

The dashboard talks to the Aegis SDK for every action that matters:
whitelisting an investor, minting an asset, reading a portfolio, reviewing a
compliance case, or rendering the outcome of a transaction. Several of these
have merged in the past with UI coverage but no coverage of the underlying
logic, which means a regression only shows up when a real wallet hits it.
This document defines the minimum tests a PR must include based on **what
kind of SDK-adjacent code it changes**, not a blanket "add tests" rule.

It supplements, and does not replace, the [PR Evidence
Checklist](pr-evidence-checklist.md) — that document governs *how* evidence
is presented in a PR; this one governs *what* automated coverage is expected
before that evidence is credible.

## Scope: what counts as an SDK-adjacent change

| Area | Where it lives |
|---|---|
| Compliance / KYC checks | `src/features/compliance/`, `src/features/admin/components/ComplianceInfo.tsx`, `src/features/admin/components/BulkComplianceReview.tsx`, `src/lib/complianceReview.ts`, `src/types/compliance.ts` |
| RWA metadata | `src/lib/aegis/`, `src/features/assets/` |
| Investor reads | `src/features/investor/`, `src/hooks/useAegis.ts`, `PortfolioReadModel` consumers |
| Admin actions | `src/features/admin/`, `src/lib/sdk/*Provider.ts` (`mint`, whitelist flows) |
| Transaction receipts | `src/components/transactions/`, `src/features/sdk-recovery/` |
| SDK provider contract | `src/lib/sdk/IAegisProvider.ts`, `MockAegisProvider.ts`, `LiveAegisProvider.ts` |

If your change touches any file in these areas, this standard applies. If
you are unsure whether a file counts, treat it as in-scope — the cost of an
unnecessary test is much lower than the cost of a silent compliance or
receipt bug.

## Minimum coverage by change type

| Change type | Unit tests | Integration tests | Negative-path tests | Fixtures | Screenshots / manual verification |
|---|---|---|---|---|---|
| **Compliance / KYC checks** | Required — every rule branch (`pass`/`fail`/`warn`/`unknown`) and every status derivation | Required if the check feeds a component (e.g. `ComplianceInfo`, `BulkComplianceReview`) | Required — rejected, review-flagged, and indeterminate subjects | Required — add a case to `src/lib/__fixtures__/complianceReview.ts` or `src/fixtures/compliance.ts` rather than inlining objects | Required for any UI change to how a compliance verdict is displayed |
| **RWA metadata** | Required — parsing, validation, and defaulting logic | Required if metadata flows into a read model or UI card | Required — missing fields, malformed values, unsupported asset types | Required — extend `src/fixtures/portfolio.ts` | Required if the asset card or detail view changes |
| **Investor reads** | Required — read-model shaping, eligibility derivation (`src/lib/eligibility.ts`) | Required for hooks that call the provider (`usePortfolio`, `useAegis`) | Required — disconnected wallet, empty portfolio, SDK error/timeout | Required — extend `src/fixtures/portfolio.ts` or the relevant `__fixtures__` file | Required for portfolio or eligibility panel changes |
| **Admin actions (mint, whitelist)** | Required — input validation, disabled/loading state derivation | Required — provider call is made with the right arguments, phase callbacks fire in order | Required — invalid address, empty input, provider rejection, double-submit | Not usually needed beyond existing fixtures | Required — before/after for `AdminPanel`, including disabled and loading states |
| **Transaction receipts / outcomes** | Required — `statusMapper.ts`, `explorerLink.ts`, and any outcome-to-copy mapping | Required — `TransactionReceipt`/`TransactionProgress` render correctly for each `RawTransactionOutcome` shape | Required — failed, pending, and "outcome could not be confirmed" (hash present, unreadable status) states | Required — one fixture per outcome shape in `src/components/transactions/fixtures.ts` | Required — the fixture gallery (`TransactionFixtureGallery`) is the fastest way to produce this evidence; screenshot it instead of hand-crafting each state |
| **SDK provider contract (`IAegisProvider` and implementations)** | Required — both `MockAegisProvider` and `LiveAegisProvider` must satisfy the same behavioural contract in `src/__tests__/sdk/provider.test.ts` | Required if a new method is added to the interface | Required — provider throwing, returning malformed data | N/A | Not required unless the change is user-visible |

If a change spans multiple rows (e.g. an admin action that also renders a
receipt), the union of both rows applies.

## Happy-path expectations

Every change in scope needs at least one test that exercises the intended,
successful outcome:

- A compliance check that should pass, with a subject fixture that satisfies
  every rule.
- A metadata parse of a well-formed RWA record.
- A portfolio read for a connected, whitelisted investor with a non-empty
  balance.
- A mint or whitelist call with a valid address, asserting the provider was
  called with the expected arguments.
- A `SUCCESS` transaction outcome rendering the success receipt copy.

A PR that only tests failure modes is as incomplete as one that only tests
success — reviewers should ask for the missing side.

## Negative-path expectations

At minimum, cover:

- **Compliance/KYC** — a subject that fails at least one rule, one that only
  warns (review state), and one with an `unknown` result (pending state).
  See `src/lib/complianceReview.test.ts` for the pattern.
- **RWA metadata** — malformed or missing fields; assert the code fails
  loudly or falls back safely, never silently drops data.
- **Investor reads** — disconnected wallet, address not whitelisted, and a
  provider error/timeout. See `src/features/investor/InvestorEligibilityPanel.test.tsx`.
- **Admin actions** — empty/invalid input (buttons stay disabled), and a
  provider rejection (surfaced through
  [SDK error recovery](sdk-error-recovery.md), not swallowed).
- **Transaction receipts** — `FAILED` outcomes, and the indeterminate case
  where a hash exists but the status can't be read. Never automatically
  retry a `sideEffectRisk` other than `none` — see `src/features/sdk-recovery/recovery.test.ts`
  for the invariant this must not regress.

Negative-path tests should assert on user-facing behavior (what renders,
what gets disabled, what copy appears) or on the return value the caller
depends on — not just that a function doesn't throw.

## Fixtures

- Reuse or extend the fixture file for the area you're touching
  (`src/fixtures/`, `src/lib/__fixtures__/`, or a feature-local
  `fixtures.ts`) rather than constructing ad hoc objects inline in a test.
  Shared fixtures make it obvious when a new PR needs a new case versus
  reusing an existing one.
- Fixtures for SDK-adjacent code should mirror shapes the real SDK, Soroban
  RPC, or Freighter actually produce — see how `src/features/sdk-recovery/fixtures.ts`
  is built directly from documented RPC envelope shapes rather than
  simplified stand-ins.
- When you add a new outcome, error category, or compliance rule, add its
  fixture in the same PR, even if only one test currently uses it. The next
  contributor should not have to reconstruct the shape from scratch.

## Manual verification and screenshots

Automated tests are required for logic; screenshots or a short recording are
required for anything the change makes visible:

- UI states for compliance verdicts, receipts, and admin panels: capture
  loading, empty, error, and success states, per the
  [Reviewer Checklist](reviewer-checklist.md#2-screenshots--recordings-check).
- For transaction receipt work specifically, prefer screenshotting the
  fixture gallery over manually reproducing each state through a live flow —
  it's faster and it's the same fixture data the tests use, so the screenshot
  and the test can't drift apart.
- Manual verification notes (which wallet state, which network, which
  fixture amount you used — see the [SDK error recovery "Trying It
  Locally" table](sdk-error-recovery.md#trying-it-locally) for the pattern)
  belong in the PR's **Testing** section, not just in a comment thread.

## No-test justification guidance

Skipping tests is acceptable only for changes with no testable logic or
user-visible behavior change:

**Acceptable to skip, with justification stated in the PR:**
- Documentation-only changes (this file included).
- Pure formatting/whitespace/comment changes.
- Config or CI changes validated by the pipeline running successfully.
- Renaming a file or export with no behavioral change (covered by
  `npx tsc --noEmit` catching broken imports).

**Not acceptable, ever, for compliance, KYC, RWA metadata, investor reads,
admin actions, or transaction receipts:**
- "Will add tests later."
- "Tested manually" with no detail on what was tried (which addresses,
  which amounts, which network).
- "Same pattern as existing code" — the existing code having tests is the
  reason to add them here too, not a reason to skip.
- No justification at all.

If you believe an SDK-adjacent change genuinely has no testable surface,
say so explicitly in the PR's **Testing** section and name the reviewer who
should confirm that judgment — do not leave the box unchecked with silence.

## Worked examples

| If your PR looks like... | Reference test to follow |
|---|---|
| New compliance rule or status derivation | `src/lib/complianceReview.test.ts` |
| New eligibility rule for investors | `src/lib/eligibility.test.ts` |
| New SDK error category or recovery action | `src/features/sdk-recovery/classify.test.ts`, `recovery.test.ts` |
| New transaction outcome shape | `src/components/transactions/TransactionFixtureGallery.test.tsx` |
| New provider method | `src/__tests__/sdk/provider.test.ts` |
| New route guard / role check | `src/features/auth/resolveRole.test.ts`, `src/lib/route-guard.test.ts` |

## Running tests locally

```bash
npm test          # runs the vitest suite (src/**/*.test.ts[x])
```

`npm test` is not currently part of the CI pipeline (`.github/workflows/ci.yml`
runs lint, typecheck, and build only), so a green CI badge does not mean the
test suite passed. Run `npm test` locally before requesting review and paste
the summary output into the PR's **Commands Run** / **Testing** sections —
this is the only signal a reviewer has that the suite was run at all.

## Related documentation

- [Aegis Dashboard Minimum Testing Standard](testing-standard.md) — the
  dashboard-wide standard this document specializes for SDK-adjacent logic;
  covers admin workflows, investor views, compliance screens, asset
  registration, minting, wallet connection, and diagnostics as a whole.
- [PR Evidence Checklist](pr-evidence-checklist.md) — how to present testing
  evidence in a PR.
- [Reviewer Checklist](reviewer-checklist.md) — what reviewers verify before
  approving.
- [SDK Error Recovery Actions](sdk-error-recovery.md) — worked example of a
  fully-tested SDK-adjacent feature, including its own reviewer checklist.
- [Testing Evidence Requirement](testing-evidence-requirement.md) — the
  general policy this document specializes for SDK-adjacent code.
