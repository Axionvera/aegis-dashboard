# Aegis Dashboard Minimum Testing Standard

> **Applies to:** Every contribution to the Aegis Dashboard — admin
> workflows, investor views, compliance screens, asset registration,
> minting, wallet connection, and diagnostics. This is the dashboard-wide
> standard; SDK-adjacent logic (compliance rules, RWA metadata parsing,
> investor read models, provider calls, transaction receipts) has an
> additional, more detailed standard: the [Aegis SDK Minimum Testing
> Standard](sdk-testing-standard.md).

## Why this exists

Contributors have merged changes to admin workflows, investor views,
compliance screens, asset registration, minting, wallet connection, and
diagnostics without adding enough tests to catch regressions. Several
user-facing components in these areas currently have no test file at all —
for example `AdminPanel.tsx`, `FeatureFlagsPanel.tsx`, `PortfolioList.tsx`,
`AssetCard.tsx`, `DiagnosticsPanel.tsx`, and the `useWallet` hook. This
document defines the minimum testing expected **per kind of change**, so a
PR's scope of coverage is predictable before review starts, not negotiated
during it.

This document is the dashboard-wide umbrella. It works alongside two other
documents that govern *process* rather than *what to test*:

- [Testing Evidence Requirement](testing-evidence-requirement.md) — what
  every PR must present as evidence (tests, screenshots, commands run).
- [PR Evidence Checklist](pr-evidence-checklist.md) — how that evidence is
  structured in the PR description.

And one document that goes deeper on SDK-adjacent logic specifically:

- [Aegis SDK Minimum Testing Standard](sdk-testing-standard.md) — required
  reading if your change touches compliance/KYC logic, RWA metadata
  parsing, investor read models, the admin mint/whitelist provider calls,
  transaction receipt rendering, or the `IAegisProvider` contract. Where
  this document and that one overlap, follow the SDK standard — it's the
  more specific rule.

## Minimum coverage by area

| Area | Where it lives | Unit tests | Integration tests | Negative-path tests | Screenshots / manual verification |
|---|---|---|---|---|---|
| **Admin workflows** | `src/features/admin/components/AdminPanel.tsx`, `FeatureFlagsPanel.tsx`, `BulkComplianceReview.tsx` | Required — button enable/disable logic, form state derivation | Required — the panel renders the right controls for the current role/flag state | Required — invalid input, denied role, provider rejection (see [SDK standard](sdk-testing-standard.md) for the mint/whitelist provider call itself) | Required — before/after screenshots covering loading, disabled, and error states |
| **Investor views** | `src/features/investor/components/PortfolioList.tsx`, `PortfolioEmptyState.tsx`, `PortfolioErrorState.tsx`, `PortfolioDisclaimer.tsx` | Required — list rendering logic for a given portfolio shape | Required — the view responds correctly to loading/empty/error/populated states from the hook it consumes | Required — empty portfolio, disconnected wallet, load error (see [InvestorEligibilityPanel.test.tsx](../src/features/investor/InvestorEligibilityPanel.test.tsx) for the pattern) | Required — one screenshot per state (empty, error, populated) |
| **Compliance screens** | `src/features/admin/components/ComplianceInfo.tsx`, `BulkComplianceReview.tsx`, `src/features/assets/components/ComplianceBadge.tsx` | Required — status-to-copy/badge mapping | Required if the screen consumes a compliance verdict from a hook or fixture | Required — rejected, review-flagged, and unknown/pending verdicts (see [ComplianceInfo.test.tsx](../src/features/admin/components/ComplianceInfo.test.tsx)) | Required for any change to how a verdict is displayed |
| **Asset registration** | `src/features/assets/components/AssetCard.tsx`, `AssetCardSkeleton.tsx`, `TransferEligibilityBadge.tsx`, RWA metadata parsing (see [SDK standard](sdk-testing-standard.md)) | Required — card rendering for a given asset shape | Required if the card consumes a live/mocked provider read | Required — missing/malformed metadata, zero balance, ineligible transfer | Required for any visual change to the card or badges |
| **Minting** | `AdminPanel.tsx` mint flow; provider call itself is covered by the [SDK standard](sdk-testing-standard.md#minimum-coverage-by-change-type) | Required — input validation before submit | Required — provider called with correct arguments, phase callbacks fire in order | Required — invalid address, empty input, provider rejection, double-submit | Required — before/after for disabled and loading states |
| **Wallet connection** | `src/hooks/useWallet.ts` | Required — `connect`, `disconnect`, and `tryAutoReconnect` state transitions | Not required unless a component's rendering depends on a specific transition | Required — Freighter not installed, `requestAccess` rejected/throws, `tryAutoReconnect` with no prior grant, network mismatch | Required if the connect/disconnect UI changes — capture the connected, disconnected, and error-banner states |
| **Diagnostics** | `src/features/diagnostics/components/DiagnosticsPanel.tsx`, `StatusCard.tsx`, `src/lib/diagnostics/redact.ts` | Required — `redact.ts` already has coverage ([redact.test.ts](../src/lib/diagnostics/redact.test.ts)); new redaction rules need a case added there | Required if `DiagnosticsPanel` changes what it reads from the wallet/feature-flag stores | Required — missing env var, wallet disconnected, malformed contract ID | Required for any layout change — the "Copy Report" output must still be redacted correctly, screenshot the copied JSON |

If a change spans multiple rows (e.g. a mint flow that also updates a
compliance badge), the union of both rows applies. If you're not sure
which row your change falls under, treat it as in-scope rather than
skipping tests — ask in the PR description if you're unsure and want a
reviewer's judgment before writing tests.

## Happy-path expectations

Every change in scope needs at least one test exercising the intended,
successful outcome — for example:

- An admin action panel with a valid address, disabled state clearing once
  input is valid.
- A portfolio view rendering a non-empty, connected, whitelisted investor's
  assets correctly.
- A compliance screen rendering a `pass` verdict with the correct badge and
  copy.
- An asset card rendering complete, well-formed metadata.
- `useWallet.connect()` succeeding: address and network set, `isConnecting`
  cleared, `connectionError` null.
- The diagnostics panel rendering a fully-populated, correctly redacted
  report.

A PR that only tests failure modes is as incomplete as one that only tests
success — reviewers should ask for the missing side.

## Negative-path expectations

At minimum, cover:

- **Admin workflows** — empty/invalid input (button stays disabled),
  provider rejection surfaced to the user (not swallowed).
- **Investor views** — empty portfolio, disconnected wallet, and a load
  error from the underlying hook.
- **Compliance screens** — failed, review-flagged, and unknown/pending
  verdicts — never default an unknown verdict to a "safe" badge.
- **Asset registration** — malformed or missing metadata fields; assert the
  UI fails visibly (an error/empty state) rather than rendering blank or
  incorrect values.
- **Minting** — invalid address, empty input, provider rejection,
  double-submit (no duplicate calls).
- **Wallet connection** — Freighter not installed (`isConnected()` returns
  false), the user rejecting the `requestAccess()` prompt, `requestAccess()`
  throwing, and `tryAutoReconnect()` running with no prior grant (must not
  show a connect popup).
- **Diagnostics** — a missing environment variable, a disconnected wallet,
  and a malformed contract ID; the report must render without throwing and
  must not leak an unredacted secret in any of these cases.

Negative-path tests should assert on user-facing behavior (what renders,
what gets disabled, what copy appears) or on the return value a caller
depends on — not just that a function doesn't throw.

## Fixtures

- Reuse or extend the fixture file for the area you're touching
  (`src/fixtures/`, `src/lib/__fixtures__/`, or a feature-local
  `fixtures.ts`) rather than constructing ad hoc objects inline in a test.
- `src/fixtures/diagnostics.ts` and `src/lib/__fixtures__/diagnostics.ts`
  already model redacted/unredacted report shapes — extend those rather
  than hand-building new report objects.
- Wallet connection tests should mock `@stellar/freighter-api`
  (`isConnected`, `isAllowed`, `requestAccess`, `getPublicKey`,
  `getNetwork`) rather than hitting the real extension — there is no
  Freighter fixture module today; if you add one, put it under
  `src/lib/__fixtures__/wallet.ts` so the next contributor reuses it
  instead of re-mocking the module from scratch.

## Manual verification and screenshots

Automated tests are required for logic; screenshots or a short recording
are required for anything the change makes visible:

- Capture loading, empty, error, and success states per the [Reviewer
  Checklist](reviewer-checklist.md#2-screenshots--recordings-check).
- For wallet connection changes, note in the PR which state you tested
  manually (Freighter not installed, locked, unlocked-and-approved,
  unlocked-and-rejected) since some of these are impractical to fully
  automate in CI.
- For diagnostics changes, paste the **Copy Report** output (with any
  remaining secrets redacted by you before pasting) so a reviewer can
  confirm redaction held.

## No-test justification guidance

Skipping tests is acceptable only for changes with no testable logic or
user-visible behavior change:

**Acceptable to skip, with justification stated in the PR:**
- Documentation-only changes (this file included).
- Pure formatting/whitespace/comment changes.
- Config or CI changes validated by the pipeline running successfully.
- Renaming a file or export with no behavioral change (covered by
  `npx tsc --noEmit` catching broken imports).

**Not acceptable, ever, for admin workflows, investor views, compliance
screens, asset registration, minting, wallet connection, or diagnostics:**
- "Will add tests later."
- "Tested manually" with no detail on what was tried (which wallet state,
  which role, which fixture data).
- "Same pattern as existing code" — the existing code having tests is the
  reason to add them here too, not a reason to skip.
- No justification at all.

If you believe a change genuinely has no testable surface, say so
explicitly in the PR's **Testing** section and name the reviewer who
should confirm that judgment — do not leave the box unchecked with
silence.

## Worked examples

| If your PR looks like... | Reference test to follow |
|---|---|
| New admin panel control or role-gated action | `src/features/admin/components/ComplianceInfo.test.tsx` |
| New investor view or portfolio state | `src/features/investor/InvestorEligibilityPanel.test.tsx`, `src/features/investor/components/TransferModal.test.tsx` |
| New compliance verdict or badge | `src/features/admin/components/ComplianceInfo.test.tsx` |
| New asset card field or eligibility badge | `src/lib/eligibility.test.ts` (eligibility logic feeding the badge) |
| New wallet connection state or Freighter interaction | No existing test file yet — `src/lib/route-guard.test.ts` shows the project's pattern for mocking wallet-dependent state; add `src/hooks/useWallet.test.ts` following that pattern |
| New diagnostics field or redaction rule | `src/lib/diagnostics/redact.test.ts` |

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

- [Aegis SDK Minimum Testing Standard](sdk-testing-standard.md) — the
  deeper standard for compliance/KYC logic, RWA metadata, investor read
  models, provider calls, and transaction receipts.
- [PR Evidence Checklist](pr-evidence-checklist.md) — how to present
  testing evidence in a PR.
- [Reviewer Checklist](reviewer-checklist.md) — what reviewers verify
  before approving.
- [Testing Evidence Requirement](testing-evidence-requirement.md) — the
  general PR evidence policy this document specializes for the dashboard's
  major feature areas.
