# Aegis Dashboard — Test-First Contribution Guide

Write tests before or alongside code. A PR with no tests (or tests added as an afterthought) is much more likely to miss edge cases, regress later, and be delayed in review.

---

## Workflow

1. **Write a test** for the behaviour you are about to implement — start with the happy path, then add negative-path cases.
2. **Run it** — see it fail (`npm test`). This confirms the test can detect the absence of the feature.
3. **Implement** the feature until the test passes.
4. **Run the full suite** — `npm test` must pass, and `npm run verify` (lint + typecheck + test + build) must be clean before requesting review.

This applies to every area of the dashboard: admin workflows, investor views, compliance screens, RWA asset registration, minting, wallet connection, and diagnostics.

---

## Testing expectations by area

Each area below links to an existing test file that shows the pattern to follow. The full minimum-coverage table is in the [Aegis Dashboard Minimum Testing Standard](testing-standard.md#minimum-coverage-by-area).

| Area | Reference test | Pattern |
|---|---|---|
| **Admin workflows** | `src/features/admin/components/ComplianceInfo.test.tsx` | Smoke-test button enable/disable logic, form state derivation, and role-gated controls. Test each role and each control state. |
| **Investor views** | `src/features/investor/InvestorEligibilityPanel.test.tsx` | Render the view under loading, empty, error, and populated states. Assert on screen text, badge labels, and presence/absence of elements. |
| **Compliance screens** | `src/features/admin/components/ComplianceInfo.test.tsx` | Test each verdict (pass, fail, pending, unknown) — never default an unknown verdict to a safe badge. |
| **Asset registration** | `src/lib/eligibility.test.ts` | Test card rendering with valid, malformed, and missing metadata. Assert the UI shows an error state rather than rendering blank or incorrect values. |
| **Minting** | `src/features/investor/components/TransferModal.test.tsx` | Test input validation before submit. Cover invalid address, empty input, provider rejection, and double-submit. |
| **Wallet connection** | `src/lib/route-guard.test.ts` (mock wallet pattern) | Test `connect`, `disconnect`, and `tryAutoReconnect` state transitions. Cover Freighter-not-installed, rejected prompt, and network mismatch. |
| **Diagnostics** | `src/lib/diagnostics/redact.test.ts` | Test redaction rules, env-var fallbacks, and malformed input. Assert the report renders without throwing and secrets remain redacted. |

---

## Happy-path expectations

Every change needs at least one test exercising the intended, successful outcome:

- Admin panel: valid input enables the submit button and calls the provider with correct arguments.
- Investor view: a non-empty, connected portfolio renders the expected assets and badges.
- Compliance screen: a `pass` verdict renders the correct badge and copy.
- Asset card: well-formed metadata renders all fields.
- Wallet connection: a successful `connect()` sets the address and network, clears `isConnecting`, and nulls `connectionError`.
- Diagnostics: a fully-populated report renders with all secrets correctly redacted.

---

## Negative-path expectations

Cover what breaks:

| Area | Minimum negative-path coverage |
|---|---|
| **Admin workflows** | Empty/invalid input (button stays disabled), provider rejection surfaced to user |
| **Investor views** | Empty portfolio, disconnected wallet, load error from the underlying hook |
| **Compliance screens** | Failed, review-flagged, and unknown/pending verdicts — never default unknown to safe |
| **Asset registration** | Malformed or missing metadata — UI must show an error/empty state, not render blank values |
| **Minting** | Invalid address, empty input, provider rejection, double-submit (no duplicate calls) |
| **Wallet connection** | Freighter not installed, user rejects prompt, `requestAccess` throws, `tryAutoReconnect` with no prior grant |
| **Diagnostics** | Missing env var, disconnected wallet, malformed contract ID — report must not throw and must not leak secrets |

Assert on user-facing behaviour (what renders, what is disabled, what copy appears) — not just that a function does not throw.

---

## No-test justification

Tests may be skipped only for changes with no testable logic or user-visible behaviour change:

**Acceptable** — state the reason in the PR:
- Documentation-only changes.
- Pure formatting, whitespace, or comment changes.
- Config or CI changes validated by the pipeline running successfully.
- Renaming a file or export with no behavioural change (typecheck catches broken imports).

**Not acceptable** — ever — for any area above:
- "Will add tests later."
- "Tested manually" with no detail on what was tried.
- "Same pattern as existing code" (existing code having tests is a reason to add them here too).
- No justification at all.

See the [full no-test justification guidance](testing-standard.md#no-test-justification-guidance) for more detail.

---

## Local commands

```bash
npm test          # run the full Vitest suite
npm run verify    # lint + typecheck + test + build — must be clean before review
```

`npm test` is not part of CI. A green CI badge does **not** mean tests passed. Always run `npm test` locally and paste the summary into your PR.

---

## Related documentation

- [Aegis Dashboard Minimum Testing Standard](testing-standard.md) — full coverage tables per area, no-test justification, worked examples
- [Aegis SDK Minimum Testing Standard](sdk-testing-standard.md) — deeper standard for compliance, KYC, RWA metadata, and SDK-adjacent logic
- [Testing Evidence Requirement](testing-evidence-requirement.md) — what every PR must present as evidence
- [PR Evidence Checklist](pr-evidence-checklist.md) — how to structure testing evidence in the PR description
- [Contribution Quality Examples](contribution-quality-examples.md) — concrete examples of acceptable and under-tested contributions
