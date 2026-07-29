# Aegis Dashboard — Contribution Quality Examples

This page documents concrete examples of contributions across five quality categories:
low-effort, partial implementation, under-tested, failing-CI, and acceptable. Each
category shows a representative submission, explains why it does or does not meet the
bar, and pairs it with an improved alternative.

Read this before opening a pull request tied to a GrantFox-evaluated issue. The
[Reviewer Checklist](reviewer-checklist.md) and
[Testing Evidence Requirement](testing-evidence-requirement.md) apply on top of these
examples — they are not optional.

---

## Contents

1. [Low-Effort Contributions](#1-low-effort-contributions)
2. [Partial Implementation](#2-partial-implementation)
3. [Under-Tested Contributions](#3-under-tested-contributions)
4. [Failing-CI Contributions](#4-failing-ci-contributions)
5. [Acceptable Contributions](#5-acceptable-contributions)
6. [Quick-Reference Summary](#6-quick-reference-summary)

---

## 1. Low-Effort Contributions

A low-effort contribution makes a change that is too narrow to address the scope of the
issue, or that skips the documentation, testing, and evidence the repo requires.

### 1a. Cosmetic rename with no functional change

**Submitted PR:**

> **Title:** "Rename variable in portfolio hook"
>
> **Description:** "Renamed `data` to `portfolioData` for clarity."
>
> **Files changed:** `src/hooks/usePortfolio.ts`
>
> **Tests added:** none
>
> **Screenshots:** none

**Why it falls short:**

- The rename is safe but produces zero observable value for end users.
- No context given for why the old name was ambiguous or where it caused confusion.
- The issue being addressed almost certainly expected more than a one-identifier change.
- A single line of description gives reviewers nothing to evaluate.

**Improved version:**

> **Title:** "Clarify hook return shape and document portfolio data contract"
>
> **Description:**
> The `usePortfolio` hook returned three undocumented fields (`data`, `err`, `ok`)
> whose meaning was only clear from reading the mock client. This PR:
>
> - Renames the return values to `portfolio`, `error`, and `isReady` to match the
>   project's naming pattern in other hooks (`useWallet`, `useAegis`).
> - Adds a TSDoc block to the hook describing each returned field and the loading
>   lifecycle.
> - Updates the two call sites (`src/pages/portfolio.tsx`,
>   `src/features/transactions/TransactionHistory.tsx`) to the new names.
>
> **Tests updated:** Updated the existing `usePortfolio` test assertions to use the
> renamed fields. All 77 tests pass.
>
> **Verification:**
> ```
> npm run lint       -> 0 errors
> npm run typecheck  -> 0 errors
> npm test           -> 77 passed, 0 failed
> npm run build      -> succeeded (9 routes)
> ```

---

### 1b. Checklist-only PR description

**Submitted PR:**

> **Title:** "Fix bug"
>
> **Description:**
> - [x] Tested locally
> - [x] CI passes
>
> **Files changed:** `src/components/AssetCard.tsx`

**Why it falls short:**

- The title gives no information about what bug was fixed or where.
- Checked boxes with no supporting detail are unverifiable — a reviewer cannot tell
  what "tested locally" means without knowing what was tested.
- No description of the root cause, the fix applied, or the affected behaviour.
- A reviewer who needs to understand the change is forced to read the diff with zero
  context.

**Improved version:**

> **Title:** "Fix missing null guard on AssetCard when portfolio fetch is pending"
>
> **Description:**
> `AssetCard` called `asset.balance.toFixed(2)` before checking that `asset` was
> defined, throwing a runtime error during the ~700ms portfolio loading window. Added
> an early `if (!asset) return null` guard before the render body.
>
> Root cause: the mock client introduces artificial latency (700ms, see
> `src/lib/aegis/client.ts` line 14) and the component assumed data was always
> present.
>
> **Manual testing:**
>
> | Scenario | Expected | Observed |
> |---|---|---|
> | Page load (loading state, 0–700ms) | Card renders null, no crash | Confirmed |
> | Page load (data resolved) | Card renders normally | Confirmed |
> | Portfolio fetch error | Error boundary catches, no crash | Confirmed |
>
> **Verification:**
> ```
> npm run lint       -> 0 errors
> npm run typecheck  -> 0 errors
> npm test           -> 77 passed, 0 failed
> ```

---

## 2. Partial Implementation

A partial implementation addresses only a subset of the acceptance criteria without
disclosing the omissions, leaving the issue effectively incomplete.

### 2a. Feature implemented but not integrated

**Submitted PR:**

> **Title:** "Add KYC badge component"
>
> **Description:** "Created a new `KycBadge` component with three states."
>
> **Files changed:** `src/components/KycBadge.tsx`
>
> **Acceptance criteria addressed:** "Badge shows Verified / Pending / Rejected states"

**Why it falls short:**

- The component exists but is not used anywhere in the application — it cannot be
  reviewed visually, and the issue acceptance criteria likely required it to appear on
  a specific page.
- No screenshots, because the component is unreachable from any route.
- No tests for the three states.
- A reviewer merging this PR ships dead code with no way to confirm it works.

**Improved version:**

> **Title:** "Add KycBadge component and integrate into AssetCard header"
>
> **Description:**
> Closes #NNN. Adds `KycBadge` showing Verified / Pending / Rejected states and
> integrates it into the `AssetCard` header row, which is visible on the Portfolio
> page for all connected wallets.
>
> **Component states:**
>
> | State | Colour | Label |
> |---|---|---|
> | Verified | `text-emerald-600` | Verified |
> | Pending | `text-amber-600` | Pending |
> | Rejected | `text-red-600` | Rejected |
>
> **Files changed:**
> - `src/components/KycBadge.tsx` (new)
> - `src/components/__tests__/KycBadge.test.tsx` (new, 6 tests)
> - `src/components/AssetCard.tsx` (integration)
>
> **Screenshots:**
>
> | State | 375px | 1280px |
> |---|---|---|
> | Verified | _(screenshot)_ | _(screenshot)_ |
> | Pending | _(screenshot)_ | _(screenshot)_ |
> | Rejected | _(screenshot)_ | _(screenshot)_ |

---

### 2b. Happy path only — missing error and empty states

**Submitted PR:**

> **Title:** "Add transaction history table to portfolio page"
>
> **Description:** "Renders a table of the user's past transactions."
>
> **Acceptance criteria not addressed:** loading state, empty state, error state

**Why it falls short:**

- The table works when data is present but crashes or renders nothing when the fetch is
  in progress, returns an empty array, or returns an error.
- The mock client's 700ms latency means the loading state is always exercised — a
  reviewer who pulls the branch will see the crash immediately.
- Three of the four acceptance criteria (loading, empty, error) are entirely absent.
- Omitting states that the reviewer *will encounter* suggests the author did not test
  beyond the happy path.

**Improved version:**

> **Title:** "Add transaction history table with loading, empty, and error states"
>
> **Description:**
> Adds a transaction history table to the Portfolio page, handling all render states
> defined in the acceptance criteria.
>
> **States implemented:**
>
> | State | Trigger condition | Rendered output |
> |---|---|---|
> | Loading | Fetch in-flight (0–700ms) | Skeleton rows (3 placeholder rows) |
> | Empty | Fetch resolved, 0 transactions | "No transactions yet" callout |
> | Error | Fetch rejected | "Could not load transactions" with retry button |
> | Populated | Fetch resolved, 1+ transactions | Table with date, type, amount, status |
>
> **Partial criteria note:** Pagination is out of scope for this PR; tracked in #NNN.

---

## 3. Under-Tested Contributions

An under-tested contribution adds logic paths that are not covered by automated tests,
leaving reviewers with no regression protection and no way to verify behaviour beyond
the author's own claim.

### 3a. Validation logic with no test file

**Submitted PR:**

> **Title:** "Add transfer amount validation"
>
> **Description:** "Added a max-amount check. Tried a large number and got an error."
>
> **Files changed:** `src/components/TransferModal.tsx`
>
> **Tests added:** none

**Why it falls short:**

- The validation logic has no automated coverage — any future edit to `TransferModal`
  can silently break it with no failing test to signal the regression.
- "Tried a large number" is not reproducible evidence: which number? what error
  message? what input method?
- Boundary values (ceiling exactly, ceiling+1, zero, negative, non-numeric) are
  entirely undocumented.
- A PR that adds branching logic without tests forces every future reviewer to manually
  re-verify the behaviour.

**Improved version:**

> **Title:** "Enforce 10,000-token ceiling on transfer amounts with boundary tests"
>
> **Description:**
> Closes #NNN. Adds client-side validation in `validateTransferAmount()` that
> blocks submission when the entered amount exceeds 10,000 tokens. Validation runs
> before the Freighter signing prompt so no gas is consumed for invalid inputs.
>
> **Files changed:**
> - `src/components/TransferModal.tsx`
> - `src/components/__tests__/TransferModal.test.tsx` (8 new test cases)
>
> **Test coverage:**
>
> ```ts
> describe('validateTransferAmount', () => {
>   it('passes when amount equals the ceiling (10000)', ...);
>   it('fails when amount exceeds the ceiling (10001)', ...);
>   it('fails for a zero amount', ...);
>   it('fails for a negative amount', ...);
>   it('fails for a non-finite value (Infinity)', ...);
>   it('fails for NaN', ...);
>   it('passes for a typical mid-range amount (500)', ...);
>   it('passes for the minimum valid amount (1)', ...);
> });
> ```
>
> **Manual verification:**
>
> | Input | Expected error | Observed |
> |---|---|---|
> | 10,000 | none — proceeds to Freighter | Confirmed |
> | 10,001 | "Amount exceeds the 10,000 token limit" | Confirmed |
> | 0 | "Amount must be greater than 0" | Confirmed |
> | -1 | "Amount must be greater than 0" | Confirmed |
> | "abc" | Input blocked (type="number") | Confirmed |

---

### 3b. Hook with side effects and no assertions

**Submitted PR:**

> **Title:** "Record transaction history in useAegis"
>
> **Description:** "useAegis now appends each confirmed transaction to history."
>
> **Files changed:** `src/hooks/useAegis.ts`
>
> **Tests added:** "Checked that the hook still loads"

**Why it falls short:**

- "Checked that the hook still loads" is not a test assertion — it verifies the
  module imports without error, not that history is recorded correctly.
- The side effect (appending to history) is the entire point of the change and is not
  tested.
- No assertion that history grows, that duplicates are excluded, or that the shape of
  each history entry is correct.
- Future refactors of `useAegis` cannot rely on a test suite to catch regressions in
  the recording behaviour.

**Improved version:**

> **Tests added:**
>
> ```ts
> describe('useAegis history recording', () => {
>   it('starts with an empty history array', ...);
>   it('appends one entry per confirmed transaction', ...);
>   it('does not append entries for failed transactions', ...);
>   it('does not append duplicate entries for the same txHash', ...);
>   it('records the correct amount, type, and timestamp on each entry', ...);
> });
> ```

---

## 4. Failing-CI Contributions

A contribution submitted with a red CI status forces reviewers to triage failures that
the author is better placed to fix. Green CI is a hard requirement before requesting
review — see [Testing Evidence Requirement](testing-evidence-requirement.md).

### 4a. Lint failures dismissed as noise

**Submitted PR:**

> **Title:** "Refactor asset fetching logic"
>
> **CI status:** 2 checks failing
>
> **Author comment:** "The lint errors are pre-existing, not from my change."

**Why it falls short:**

- Lint errors are deterministic. If they appear in CI on this branch, they exist on
  this branch — regardless of their origin.
- A reviewer cannot distinguish which errors predate the PR without comparing branches
  manually.
- Claiming errors are pre-existing without fixing them passes the cleanup cost to the
  next contributor.
- CI being red at review time signals the author did not run `npm run lint` locally
  before pushing.

**Improved version:**

> **Title:** "Refactor asset fetching logic"
>
> **CI status:** All checks passing
>
> **Fixes applied before opening PR:**
> - Removed stale `useCallback` import flagged by lint (unrelated to this PR's diff
>   but in the same file — cleaned up proactively).
> - Added `fetchAssets` to the `useEffect` dependency array that ESLint flagged.
>
> **Verification:**
> ```
> npm run lint       -> 0 errors, 0 warnings
> npm run typecheck  -> 0 errors
> npm test           -> 77 passed, 0 failed
> npm run build      -> succeeded
> ```

---

### 4b. Type errors deferred to "later"

**Submitted PR:**

> **Title:** "Add isLoading prop to AssetCard"
>
> **CI status:** 1 type check failure
>
> **Author comment:** "Will fix types in a follow-up PR."

**Why it falls short:**

- Type errors are not a separate concern to defer — they mean the code is structurally
  incorrect in a way TypeScript can detect without running it.
- A "follow-up PR" for a type fix that should be part of this PR inflates the PR count
  and adds noise to the git history.
- Merging a type error into `main` breaks the type check for every other contributor
  working on an unrelated area.

**Improved version:**

> **Title:** "Add optional isLoading prop to AssetCard with skeleton state"
>
> **Type fix applied:**
> Updated `AssetCardProps` interface:
> ```ts
> interface AssetCardProps {
>   asset: Asset;
>   isLoading?: boolean;  // added; defaults to false via destructuring
> }
> ```
> Updated all four call sites to pass `isLoading={portfolioLoading}` where
> applicable.
>
> **Verification:**
> ```
> npm run typecheck  -> 0 errors
> npm run lint       -> 0 errors
> npm test           -> 77 passed, 0 failed
> ```

---

### 4c. Common failing-CI patterns

| Failure category | Root cause | Resolution before submitting |
|---|---|---|
| Lint errors | Unused imports, missing hook dependencies, `any` usage | Run `npm run lint -- --fix`; review remaining manual fixes |
| Type errors | Wrong prop types, missing interface fields, implicit `any` | Run `npm run typecheck`; narrow types or add missing fields |
| Test failures | Logic change broke an existing assertion | Update the assertion or the implementation; do not delete tests to clear CI |
| Build failures | Import path wrong, missing export, tree-shake issue | Run `npm run build` locally; rebase on `main` if stale |
| Stale branch | Main moved; merge conflict caused a broken import | Rebase or merge `main` into the branch and re-run all checks |

---

## 5. Acceptable Contributions

An acceptable contribution closes the full scope of the issue, passes all automated
checks, includes evidence a reviewer can independently verify, and leaves the codebase
in a better state than it found it.

### 5a. Logic change with boundary tests and CI output

> **Title:** "Normalise transaction status casing before display"
>
> **Description:**
> Closes #NNN. The Stellar SDK returns transaction statuses in mixed case
> (`SUCCESS`, `success`, `Success` all observed across testnet and mainnet). The
> transaction history table was displaying raw values, so the same outcome showed
> three different labels depending on which RPC node responded.
>
> This PR normalises the status field to uppercase at the boundary in
> `normalizeTransaction()` and updates the display map accordingly.
>
> **Files changed:**
> - `src/features/transactions/normalize.ts`
> - `src/features/transactions/__tests__/normalize.test.ts` (4 new cases)
>
> **New test cases:**
>
> ```ts
> describe('normalizeTransaction — status casing', () => {
>   it('normalises lowercase "success" to SUCCESS', ...);
>   it('normalises title-case "Success" to SUCCESS', ...);
>   it('normalises "failed" to FAILED', ...);
>   it('passes through an already-uppercase status unchanged', ...);
> });
> ```
>
> **Verification:**
> ```
> npm run lint       -> 0 errors
> npm run typecheck  -> 0 errors
> npm test           -> 81 passed, 0 failed
> npm run build      -> succeeded
> ```
>
> **Screenshots:** Transaction history table showing consistent status labels across
> three mock transactions with varied raw status values _(screenshot attached)_.

---

### 5b. UI change with before/after evidence across viewports

> **Title:** "Fix portfolio card overflow at narrow mobile widths"
>
> **Description:**
> Closes #NNN. On viewports narrower than 400px (iPhone SE, Galaxy A15), the balance
> figure and the transfer button in `AssetCard` overflowed their container and
> overlapped. Root cause: the card actions row used `gap-4` with no wrapping rule,
> so at narrow widths both items exhausted the available width.
>
> Fix: changed `gap-4` to `gap-2 flex-wrap` on the actions row. The transfer button
> now wraps below the balance on very narrow screens and remains side-by-side on
> everything 400px and above.
>
> **Files changed:** `src/components/AssetCard.tsx`
>
> **Screenshots:**
>
> | Viewport | Before | After |
> |---|---|---|
> | 360px | _(overflow screenshot)_ | _(correct layout screenshot)_ |
> | 414px | _(overflow screenshot)_ | _(correct layout screenshot)_ |
> | 768px | _(unchanged — no regression)_ | _(unchanged — no regression)_ |
>
> **Browsers verified:** Chrome 126, Firefox 127, Safari 17.
>
> **Verification:**
> ```
> npm run lint       -> 0 errors
> npm run typecheck  -> 0 errors
> npm test           -> 77 passed, 0 failed
> ```

---

### 5c. Documentation addition that is itself well-evidenced

> **Title:** "Add mock SDK behaviour reference to architecture doc"
>
> **Description:**
> Closes #NNN. The mock client in `src/lib/aegis/client.ts` encodes demo states via
> magic amounts (0.01 → FAILED, 0.02 → PENDING, 0.03 → unknown status) and a 700ms
> artificial latency, but this was only discoverable by reading the source file.
> Contributors spending time configuring environment variables that currently have no
> effect were not warned.
>
> This PR adds a "Mock SDK Behaviour" section to `docs/architecture.md` covering:
> - Which operations are mocked vs. real
> - The magic amounts and the states they trigger
> - The whitelist heuristic (`address.startsWith('G') && length > 50`)
> - The mock wallet addresses from `docs/route-access.md`
> - The env vars that are display-only until `@aegis/sdk` is integrated
>
> **Verification:**
> All links in the updated doc resolve to existing files. Ran `npm run build` to
> confirm no import regressions from the doc-only change.
> ```
> npm run lint       -> 0 errors (no source files changed)
> npm run typecheck  -> 0 errors (no source files changed)
> npm test           -> 77 passed, 0 failed
> npm run build      -> succeeded
> ```

---

## 6. Quick-Reference Summary

### Contribution anti-patterns

| Anti-pattern | Category | Consequence |
|---|---|---|
| Single-sentence PR description | Low-effort | Reviewer cannot evaluate intent or scope |
| Checked boxes with no supporting detail | Low-effort | Unverifiable; evaluator assumes nothing was tested |
| Component added but not integrated | Partial | Dead code merged; acceptance criteria unmet |
| Happy path only, no error/empty states | Partial | Crashes in states a reviewer will encounter on first load |
| Logic change with no test file | Under-tested | No regression protection; future edits break silently |
| "Tested locally" with no specifics | Under-tested | Unverifiable; different from what CI and reviewers see |
| CI failing at review time | Failing-CI | Reviewer must triage failures the author was better placed to fix |
| "Will fix types in a follow-up" | Failing-CI | Breaks typecheck for every contributor working on main |

### What an acceptable contribution includes

| Item | Required for |
|---|---|
| PR description explaining what, why, and how verified | All PRs |
| `npm run lint` output showing 0 errors | All PRs |
| `npm run typecheck` output showing 0 errors | All PRs |
| `npm test` output showing all tests passing | All PRs touching `src/` |
| Before/after screenshots at affected breakpoints | Any UI change |
| Screenshots covering all render states (loading, empty, error, populated) | New components and data-fetching flows |
| Unit tests for every new branching path | Logic and validation changes |
| Manual test table (input / expected / observed) | Validation and edge-case changes |
| All acceptance criteria addressed, or omissions explained | All PRs |

---

## Related Reading

- [PR Evidence Checklist](pr-evidence-checklist.md) — structured checklist for what
  every PR description must include
- [Testing Evidence Requirement](testing-evidence-requirement.md) — the policy behind
  the evidence requirements and when each item applies
- [Aegis Dashboard Testing Standard](testing-standard.md) — minimum test coverage
  required per kind of change (admin workflows, investor views, compliance screens,
  wallet connection, diagnostics)
- [Aegis SDK Testing Standard](sdk-testing-standard.md) — minimum coverage for
  compliance, KYC, RWA metadata, and SDK-adjacent logic
- [Low-Effort PR Examples](low-effort-pr-examples.md) — additional screenshot and
  CI-specific anti-patterns
- [Reviewer Checklist](reviewer-checklist.md) — the full review process used on
  GrantFox-submitted PRs
- [Payment-Period Conduct Note](payment-period-conduct.md) — conduct expectations
  during evaluation windows
- [Contributor Payment Guide](contributor-payment-guide.md) — how GrantFox evaluates
  contributions for compensation
