# Contributor Experience Review: Aegis RWA Dashboard

> **Type:** Documentation / Process review
> **Date:** 2026-07-28
> **Reviewed commit:** `1df6beb` (`main` at time of review)
> **Scope:** Onboarding friction, setup/command friction, component & route structure, SDK integration, fixtures, testing gaps, documentation gaps, and review-requirement clarity.
> **Terminology note:** This repository uses the Next.js **pages router** (`src/pages/`). References to `app/` in issues and checklists should be read as `src/pages/` — see finding **CX-C3**.

---

## Executive Summary

The Aegis RWA Dashboard is buildable and testable from a fresh clone in under ten minutes, and it has an unusually strong documentation culture for an MVP — a PR template, a reviewer checklist, route-access docs, a troubleshooting guide, and a diagnostics page all exist and are broadly accurate.

The main contributor-experience risks are not missing documents but **drift between documents and code**: a stale `jest.config.js` while tests actually run on Vitest, CI that never runs the test suite docs claim it runs, a broken path in `feature-flags.md`, 12 unlinked orphan docs (including `architecture.md`), and a Tailwind `content` config that silently drops styles for every component under `src/features/**`. Individually each is small; together they create a "death by a thousand cuts" onboarding experience where a new contributor cannot fully trust what the docs tell them.

**Baseline verification (fresh clone, Node v20.20.2 / npm 10.8.2):**

| Check | Command | Result |
|---|---|---|
| Install | `npm install` | ✅ Pass |
| Lint | `npm run lint` | ✅ Pass (0 warnings/errors) |
| Type check | `npx tsc --noEmit` | ✅ Pass (no script alias — see CX-A3) |
| Build | `npm run build` | ✅ Pass (9 static routes) |
| Unit tests | `npm test` | ✅ Pass (11 files, 77 tests) |
| Test step in CI | — | ❌ Absent (see CX-F1) |

---

## How This Review Was Conducted

1. Fresh `git clone` followed by the README setup path exactly as written.
2. Ran every command a contributor would: `npm install`, `npm run dev`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`.
3. Mapped every page in `src/pages/` against `docs/route-access.md` and `src/features/auth/routes.ts`.
4. Traced the SDK surface (`src/lib/aegis/client.ts` → `src/hooks/useAegis.ts` → features) and compared it against what the docs claim.
5. Inventoried fixtures, test files, and docs; cross-checked every path referenced in `docs/` against the actual tree.
6. Inspected the compiled production CSS (`.next/static/css/*.css` after `npm run build`) for utilities used only in `src/features/**`.
7. Read all 21 docs in `docs/` plus `README.md`, `CONTRIBUTING.md`, `.github/`, and root configs.

**Severity scale used below:**

| Severity | Meaning |
|---|---|
| **High** | Actively breaks or silently corrupts a contributor's work; docs make a false claim. |
| **Medium** | Causes confusion, rework, or failed commands; costs a new contributor real time. |
| **Low** | Polish/consistency issue; minor friction. |

---

## What Already Works Well

Worth preserving before listing friction:

- **The happy path works.** Clone → `npm install` → `npm run dev` → `http://localhost:3000` succeeds with no native modules or extra services. Freighter is only needed for wallet flows.
- **Docs culture is real.** `docs/troubleshooting.md`, `docs/route-access.md`, `docs/testing-evidence-requirement.md`, `docs/reviewer-checklist.md`, and `.github/pull_request_template.md` exist, cross-link, and are mostly accurate. Many repos at this stage have none of this.
- **Contributors can verify their own setup.** The `/diagnostics` page with a redacted "Copy Report" button is a genuinely contributor-friendly support tool.
- **Pure, testable cores.** Domain logic is deliberately separated from React (`src/lib/complianceReview.ts`, `src/lib/eligibility.ts`, `src/lib/route-guard.ts`, `src/features/transactions/normalize.ts`), which is why 77 unit tests run in ~2.3s of test time.
- **Route guard UX.** `RouteGuard` + `AccessUnavailable` give blocked users an explanation instead of a blank screen, and mock role wallets are documented in `docs/route-access.md`.

---

## A. Setup & Command Friction

| ID | Severity | Affected paths | Finding |
|---|---|---|---|
| CX-A1 | **Medium** | `jest.config.js` (root), `package.json` | **Stale Jest config.** Tests run on Vitest (`vitest.config.ts`, `vitest.setup.ts`, `npm test` → `vitest run`, `tsconfig.json` → `"types": ["vitest/globals", ...]`), yet a `jest.config.js` remains declaring a `ts-jest` preset — and neither `jest` nor `ts-jest` is installed. A contributor who sees the file may reasonably run `npx jest` or write Jest-style setup and fail. |
| CX-A2 | **Medium** | `docs/payment-period-conduct.md`, `package.json` | **Phantom `verify` command.** The conduct doc requires "a single `npm run verify` or equivalent", but no `verify` script exists in `package.json`. A contributor literally cannot comply with the instruction; the command exits with `npm error Missing script: "verify"`. |
| CX-A3 | **Low** | `package.json`, `.github/workflows/ci.yml`, `docs/reviewer-checklist.md` | **No `typecheck` script.** CI enforces `npx tsc --noEmit`, but there is no npm alias for it, and the reviewer checklist's "Common failure points" table lists build/lint/dev/start — omitting both typecheck and `npm test`, the two checks a reviewer most needs a contributor to run. |
| CX-A4 | **Low** | `README.md`, `package.json`, `.github/workflows/ci.yml` | **Node version ambiguity.** README says "v18+", CI pins Node 20, and there is no `engines` field or `.nvmrc`. Contributors on 18 are "supported" per the README but out of step with CI. |
| CX-A5 | **Low** | `README.md`, `.env.example`, `docs/troubleshooting.md` | **Incomplete setup step.** README's "Local Setup" never mentions copying `.env.example` to `.env.local`; the troubleshooting guide assumes it was done. (Currently harmless because nothing functional reads the vars — see CX-D3 — but the docs contradict each other about whether it is required.) |

## B. Silent Styling Loss (Build Tooling)

| ID | Severity | Affected paths | Finding |
|---|---|---|---|
| CX-B1 | **High** | `tailwind.config.js`, `src/features/**`, `docs/design-guidelines.md` | **Tailwind does not scan `src/features/**`.** `content` covers only `./src/pages/**` and `./src/components/**`. Verified against the production build: 54+ utility classes used exclusively by feature components are **absent from the compiled CSS** (`.next/static/css/*.css`) — e.g. `animate-pulse` (`AssetCardSkeleton.tsx`), `bg-aegis-accent` and `hover:bg-emerald-600` (the Admin mint button), `max-w-md`, `shadow-lg`, and several `disabled:`/`hover:` variants. Components relying on them silently lose styling. This is also a trap for reviewers: UI can look correct in one file's shared classes while being unstyled in feature-only classes. `docs/design-guidelines.md` never mentions registering new source folders in `tailwind.config.js`. |

## C. Component & Route Structure

| ID | Severity | Affected paths | Finding |
|---|---|---|---|
| CX-C1 | **Medium** | `src/pages/compliance.tsx`, `src/pages/diagnostics.tsx`, `src/features/auth/routes.ts`, `docs/route-access.md` | **Guard coverage is inconsistent and undocumented.** `docs/route-access.md` and `dashboardRoutes` map 4 protected routes (`/portfolio`, `/transactions`, `/issuer`, `/admin`). But `/compliance` exists outside that system — it hand-rolls a `useWallet()` address check (no role check, despite rendering an admin-oriented queue), and `/diagnostics` has no guard at all. If the omission is intentional (public diagnostics, fixture-only compliance queue), it should be written down; today a contributor adding a route cannot tell what the rule is. |
| CX-C2 | **Low** | `docs/architecture.md`, `src/components/`, `src/features/` | **No written placement rule for components.** Code lives under three roots — `src/components/` (plus `layout/` and `transactions/`) and per-feature `src/features/<domain>/components/`. The boundary is blurred in practice: `src/components/TransactionHistory.tsx` is a page-level feature view that consumes `src/features/transactions/store.ts`. `docs/architecture.md` describes the folders but not the decision rule ("when does a component belong in a feature module?"), so placement becomes a per-PR negotiation. |
| CX-C3 | **Low** | `docs/reviewer-checklist.md`, issue templates | **`/app` terminology mismatch.** The reviewer checklist asks whether components are in "(`/components`, `/app`, etc.)" and upstream issues reference an `app/` folder — this repo uses the pages router (`src/pages/`); there is no `app/` directory. New contributors looking for it will be confused. |

## D. SDK Integration Friction

| ID | Severity | Affected paths | Finding |
|---|---|---|---|
| CX-D1 | **High** | `src/lib/aegis/client.ts`, `src/hooks/useAegis.ts`, `docs/architecture.md`, `docs/diagnostics.md`, `docs/investor-dashboard.md` | **The SDK is fake and the docs blur that.** `@aegis/sdk` is not a dependency; `src/lib/aegis/client.ts` is a hand-written mock returning hardcoded portfolios and simulated latency. The file itself is honest (excellent header comment), but `docs/architecture.md` says `useAegis` "currently wraps the `@aegis/sdk`" as if it exists, and `docs/diagnostics.md` claims the diagnostics page reports "the version of `@aegis/sdk` being used" — the panel actually hardcodes `Mocked v0.0.0`. There is no single contributor-facing doc that states: *what is mocked, what is real, and what the swap-in plan is*. |
| CX-D2 | **Medium** | `src/lib/aegis/client.ts`, `docs/transaction-components.md` | **Mock behavior triggers are discoverable only by reading source.** The mock encodes demo states via magic amounts (`0.01` → `FAILED`, `0.02` → `PENDING`, `0.03` → unknown status), a 700ms portfolio latency, and a whitelist heuristic (`address.startsWith('G') && length > 50`). These are exactly what a contributor needs to demo or screenshot every transaction state, but they live only in code comments — not in `docs/transaction-components.md` or any setup guide. |
| CX-D3 | **Medium** | `.env.example`, `src/features/diagnostics/components/DiagnosticsPanel.tsx`, `src/lib/aegis/client.ts` | **Env vars currently do nothing functional.** `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_NETWORK_PASSPHRASE`, and `NEXT_PUBLIC_AEGIS_CONTRACT_ID` are documented as required configuration (troubleshooting guide blames them for failures) but are read only by `DiagnosticsPanel` for display; the mock client ignores them. Contributors can spend time "fixing" configuration that has no effect. The release-readiness review flags this for production, but nothing tells a *contributor* this on day one. |
| CX-D4 | **Low** | `src/features/auth/`, `docs/route-access.md` | **First-run confusion from mocked roles.** Role resolution is heuristic/fixture-based with ~400ms artificial latency per lookup (visible as a ~2s test file). A contributor who connects any real Freighter address gets `role_unavailable` on every guarded page and no obvious hint that they must use the documented mock wallet addresses. One sentence in the README or troubleshooting guide would remove this. |

## E. Fixtures & Mock Data

| ID | Severity | Affected paths | Finding |
|---|---|---|---|
| CX-E1 | **Medium** | `src/features/auth/fixtures.ts`, `src/features/transactions/fixtures.ts`, `src/components/transactions/fixtures.ts`, `src/lib/__fixtures__/`, `docs/` | **Three fixture conventions coexist with no written rule:** (1) colocated `fixtures.ts` inside a feature/component folder, (2) a dedicated `src/lib/__fixtures__/` directory, (3) fixtures imported straight into a production page (`src/pages/compliance.tsx` imports `sampleSubjects` from `src/lib/__fixtures__/complianceReview`). A contributor adding fixtures has no way to know which pattern to follow. |
| CX-E2 | **Low** | `src/pages/compliance.tsx`, `docs/bulk-compliance-review.md` | **A production page is wired to fixtures with only an inline comment saying so.** `/compliance` renders `sampleSubjects` as its sole data source. `docs/bulk-compliance-review.md` thoroughly documents the table engine but never mentions the page's data is fixture-backed, and no doc explains that `/compliance` is a mock queue. |

## F. Testing Gaps

| ID | Severity | Affected paths | Finding |
|---|---|---|---|
| CX-F1 | **High** | `.github/workflows/ci.yml`, `docs/testing-evidence-requirement.md`, `.github/pull_request_template.md` | **CI never runs the tests.** `ci.yml` runs lint → `tsc --noEmit` → build; there is no `npm test` step. Meanwhile `docs/testing-evidence-requirement.md` tells contributors that green CI "signals that the branch builds, lints, and passes the full test suite", and the PR template has a "CI status" checkbox. Both artifacts currently assert something false: a branch can be green with failing tests. This is the single most consequential review-process gap. |
| CX-F2 | **Medium** | `src/` | **Unit coverage is strong for engines, thin for UI.** 77 passing tests cover the pure logic well, but there are no tests for `RouteGuard`, the navbar's role-filtered links (`Navbar.tsx`/`MobileNav.tsx`), `useWallet`, `useAegis` history-recording side effects, `TransactionHistory`, `TransferModal`, or `AdminPanel`. No E2E suite exists (also flagged in `docs/release-readiness-review.md`), so the wallet-connection and transfer happy paths are only ever verified manually with screenshots. |
| CX-F3 | **Low** | `.github/ISSUE_TEMPLATE/workflows/` | **Dead workflow copies.** `auto-trigger.yml` and `trigger-auto-assign.yml` exist both under `.github/workflows/` (active) and `.github/ISSUE_TEMPLATE/workflows/` (inert — GitHub only reads workflows from `.github/workflows/`). Contributors inspecting automation can't tell which copy is real or whether the duplicates were intentional. |

## G. Documentation Gaps

| ID | Severity | Affected paths | Finding |
|---|---|---|---|
| CX-G1 | **High** | `docs/feature-flags.md` | **Broken path reference.** The doc states the flags panel "lives at `src/components/FeatureFlagsPanel.tsx`"; the file is actually at `src/features/admin/components/FeatureFlagsPanel.tsx`. The test it points contributors at (`src/__tests__/hooks/useFeatureFlags.test.ts`) is correct — the component path is not. |
| CX-G2 | **Medium** | `README.md`, `docs/` | **No documentation index; 12 of 21 docs are unreachable from the README.** Orphan docs: `architecture.md`, `frontend-guide.md`, `design-guidelines.md`, `accessibility-checklist.md`, `diagnostics.md`, `feature-flags.md`, `investor-dashboard.md`, `investor-transfer-eligibility.md`, `admin-role-management-design.md`, `bulk-compliance-review.md`, `transaction-components.md`, `release-testing-checklist.md`. The README instead accretes a new section per doc, so discovery depends on scrolling. Notably `architecture.md` and `frontend-guide.md` — the two most onboarding-relevant docs — are unlinked. |
| CX-G3 | **Medium** | `CONTRIBUTING.md` | **`CONTRIBUTING.md` is seven lines.** It covers branch naming, responsiveness, and PR screenshots — but not how to install, run, lint, typecheck, or test the project, which runner tests use, where fixtures go, or where the docs live. The actual expectations are scattered across `reviewer-checklist.md`, `testing-evidence-requirement.md`, `contributor-payment-guide.md`, and `frontend-guide.md`. The file most contributors open first is the thinnest one in the repo. |
| CX-G4 | **Low** | `src/`, `.eslintrc.json`, `docs/design-guidelines.md` | **No code-style source of truth.** Import quote style is split between single quotes (older files: `Navbar.tsx`, `RouteGuard.tsx`) and double quotes (newer files: `compliance.tsx`, `BulkComplianceReview.tsx`, `MobileNav.tsx`); `useWallet.ts` also mixes indentation. ESLint (`next/core-web-vitals`) doesn't enforce a style and there is no Prettier config, so each PR drifts a little more. |
| CX-G5 | **Low** | `.gitignore`, `next-env.d.ts` | **`next-env.d.ts` is both tracked in git and listed in `.gitignore`.** Next.js regenerates this file; the repo should pick one convention (the standard is: do not commit, keep ignored). |
| CX-G6 | **Low** | `docs/contributor-payment-guide.md` | **Empty example placeholder.** Under "Screenshots and Tests", the doc reads "**Commands run** (e.g., )" — the example command was never filled in. In a doc whose whole purpose is telling contributors exactly what to paste into a PR, the empty parentheses read as a bug. |

---

## Consolidated Documentation Gap List

Gaps where a document is *missing entirely* (as opposed to wrong/drifted, covered above):

1. **No docs index** (`docs/README.md` or README TOC) — see CX-G2.
2. **No mock/SDK contract doc** — what is mocked, magic amounts, whitelist heuristic, mock wallets, swap-in plan (CX-D1, CX-D2, CX-D4). `docs/investor-dashboard.md` covers the portfolio slice only.
3. **No fixtures convention doc** — where fixtures live, naming, production-import policy (CX-E1, CX-E2).
4. **No component placement / folder-ownership rule** — `src/components/` vs `src/features/**` (CX-C2), including "register new folders in `tailwind.config.js`" (CX-B1).
5. **No expanded contributor onboarding** — setup → run → verify → submit flow in `CONTRIBUTING.md` (CX-A1–A5, CX-G3).

---

## Follow-Up Recommendations

Proposed as standalone, issue-ready items, ordered by value-per-effort. None of these are implemented by this review — each should land as its own focused PR per the repo's review process.

| # | Priority | Recommendation | Addresses | Effort |
|---|---|---|---|---|
| 1 | **P0** | Add a `Test` step (`npm test`) to `.github/workflows/ci.yml`, or correct the claim in `docs/testing-evidence-requirement.md`. Prefer adding the step. | CX-F1 | XS |
| 2 | **P0** | Add `"./src/features/**/*.{js,ts,jsx,tsx,mdx}"` (and `src/hooks`, `src/lib` for safety) to `tailwind.config.js` `content`; note the requirement in `docs/design-guidelines.md`. | CX-B1 | XS |
| 3 | **P1** | Fix the panel path in `docs/feature-flags.md` (`src/features/admin/components/FeatureFlagsPanel.tsx`). | CX-G1 | XS |
| 4 | **P1** | Delete the stale `jest.config.js`; state in `README.md`/`CONTRIBUTING.md` that Vitest is the single test runner. | CX-A1 | XS |
| 5 | **P1** | Create `docs/README.md` (or a README TOC) indexing all 21 docs by audience: *onboarding*, *building features*, *review & payment*, *release*. | CX-G2 | S |
| 6 | **P1** | Expand `CONTRIBUTING.md`: setup, dev server, `npm run lint`, `npm test`, `npx tsc --noEmit` (or a new `typecheck` script), docs map, fixture conventions. | CX-A3, CX-G3 | S |
| 7 | **P1** | Add a "Mock SDK" doc (or a section in `docs/architecture.md`): what's mocked, magic amounts (`0.01/0.02/0.03`), whitelist heuristic, mock role wallets, env vars currently display-only, and the swap-in plan for `@aegis/sdk`. | CX-D1–D4 | S |
| 8 | **P2** | Reconcile `npm run verify`: either add a `verify` script (`lint && tsc --noEmit && test && build`) to `package.json` or update `docs/payment-period-conduct.md` to name real commands. Fill in the empty "(e.g., )" example in `docs/contributor-payment-guide.md` at the same time. | CX-A2, CX-G6 | XS |
| 9 | **P2** | Decide the guard policy for `/compliance` and `/diagnostics` (guard them via `RouteGuard`/`dashboardRoutes`, or document them as intentionally public in `docs/route-access.md`); document the fixture-only data source of `/compliance`. | CX-C1, CX-E2 | S |
| 10 | **P2** | Standardize fixtures: one convention (colocated `fixtures.ts` *or* `__fixtures__/`), a sentence in `docs/architecture.md` + `CONTRIBUTING.md`, and a rule on importing fixtures into production pages. | CX-E1 | S |
| 11 | **P3** | Remove the inert `.github/ISSUE_TEMPLATE/workflows/` copies; fix `app/` wording in `docs/reviewer-checklist.md`; resolve the `next-env.d.ts` tracked-vs-ignored conflict; align Node versions (README `v18+`, CI `20`, optional `engines`/`.nvmrc`). | CX-F3, CX-C3, CX-G5, CX-A4 | XS |
| 12 | **P3** | Adopt a formatting source of truth (Prettier config or an ESLint stylistic rule) and note quote/indent style in `docs/design-guidelines.md`; then add UI tests for `RouteGuard`, role-filtered nav, and `TransferModal` flows (E2E remains tracked by `docs/release-readiness-review.md`). | CX-G4, CX-F2 | M |

---

## Appendix: Acceptance-Criteria Mapping

| Acceptance criterion (issue) | Covered by |
|---|---|
| Setup and command friction reviewed | Section A (CX-A1 – CX-A5) |
| Component and route structure reviewed | Sections B & C (CX-B1, CX-C1 – CX-C3) |
| SDK integration friction assessed | Section D (CX-D1 – CX-D4) |
| Fixtures reviewed | Section E (CX-E1 – CX-E2) |
| Testing gaps / review requirements | Section F (CX-F1 – CX-F3) |
| Documentation gaps listed | Section G + consolidated gap list |
| Follow-up recommendations included | Prioritized table (12 items) |

## Appendix: Files Consulted for This Review

- **Root:** `README.md`, `CONTRIBUTING.md`, `package.json`, `jest.config.js`, `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.json`, `tailwind.config.js`, `.eslintrc.json`, `.env.example`, `.gitignore`
- **CI/automation:** `.github/workflows/ci.yml`, `.github/workflows/auto-trigger.yml`, `.github/workflows/trigger-auto-assign.yml`, `.github/ISSUE_TEMPLATE/workflows/*`, `.github/pull_request_template.md`
- **Docs:** all 21 files under `docs/`
- **Source:** `src/pages/*`, `src/components/**`, `src/features/**`, `src/hooks/*`, `src/lib/**`, `src/types/*`, `src/utils/*`
</content>
