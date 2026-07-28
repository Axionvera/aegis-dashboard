# Aegis Dashboard — Low-Effort PR Examples

This document shows common PR submissions that are unlikely to pass GrantFox evaluation and how to improve them. Each section pairs a minimal, checklist-only submission with an improved version that demonstrates real effort.

---

## 1. Low-Effort UI Changes Without Screenshots

UI-only changes are among the easiest to under-document. A PR that touches `.tsx` or `.css` files but lacks visual proof is immediately flagged.

### Minimal submission

> **PR Title:** "Fix button alignment on portfolio page"
>
> **Description:**
> - [x] Fixed button alignment
> - [x] Tested locally
>
> **Files changed:** `src/components/AssetCard.tsx`
>
> **Screenshots:** _none_

**Why it fails:**
- No before/after screenshots — reviewer cannot verify the visual change
- Single-line description gives zero context on what was wrong or how it was fixed
- No indication of which browsers or viewports were tested
- Checklist items are generic and unverifiable

### Improved version

> **PR Title:** "Fix asset card button misalignment on mobile viewports"
>
> **Description:**
> - Asset card transfer buttons overflowed their container at widths below 400px
> - Replaced `gap-4` with `gap-2` and added `flex-wrap` to the card actions row
> - Verified on Chrome, Firefox, and Safari at 375px, 414px, and 390px
> - [x] Buttons remain clickable and do not overlap card borders
> - [x] Desktop layout unchanged (regression check at 1280px+)
>
> **Files changed:** `src/components/AssetCard.tsx`
>
> **Screenshots:**
> | Before (375px) | After (375px) |
> |---|---|
> | ![before](https://example.com/before.png) | ![after](https://example.com/after.png) |

**What makes it better:**
- Before/after screenshots at the breakpoint that broke
- Specific description of the root cause and the exact CSS change
- Browser and viewport test matrix stated explicitly
- Regression check confirmation for larger viewports
- Checklist items are concrete and verifiable

---

## 2. Under-Tested PRs

PRs that add logic, state changes, or API calls without corresponding test coverage or manual verification evidence.

### Minimal submission

> **PR Title:** "Add transfer validation for large amounts"
>
> **Description:**
> - Added max-amount check to the transfer modal
> - It works when I tested it
>
> **Files changed:** `src/components/TransferModal.tsx`
>
> **Tests added:** _none_
>
> **Manual testing:** "Tried a big number, got an error"

**Why it fails:**
- No unit or integration tests for new validation logic
- Manual testing description is vague — which values were tried? What error appeared?
- No edge case documentation (zero, negative, empty, NaN)
- Single file change with no corresponding test file

### Improved version

> **PR Title:** "Enforce transfer amount ceiling of 10,000 tokens"
>
> **Description:**
> - Transfers exceeding 10,000 tokens now show a validation error before the transaction is submitted
> - Validation runs client-side in `validateTransfer()` before the Freighter prompt
> - Added 6 test cases covering the full boundary
>
> **Files changed:**
> - `src/components/TransferModal.tsx`
> - `src/components/__tests__/TransferModal.test.tsx`
>
> **Tests added:**
> ```ts
> describe('transfer amount ceiling', () => {
>   it('allows 10,000 tokens (at ceiling)', () => { ... });
>   it('rejects 10,001 tokens (above ceiling)', () => { ... });
>   it('allows 0 tokens (zero amount)', () => { ... });
>   it('rejects negative amounts', () => { ... });
>   it('rejects non-numeric input', () => { ... });
>   it('allows 1 token (normal amount)', () => { ... });
> });
> ```
>
> **Manual testing:**
> | Input | Expected result | Observed |
> |---|---|---|
> | 10,000 | Transfer proceeds | ✅ |
> | 10,001 | "Amount exceeds maximum" error | ✅ |
> | 0 | "Amount must be greater than 0" | ✅ |
> | -5 | "Amount must be greater than 0" | ✅ |
> | "abc" | Input prevented (type="number") | ✅ |

**What makes it better:**
- Test file added with 6 explicit boundary cases
- Manual test table with input → expected → observed columns
- Validation logic name and location stated clearly
- Edge cases covered: ceiling boundary, zero, negative, non-numeric

---

## 3. Screenshot-Free UI Examples

This section shows realistic, concrete examples of what screenshot-free UI PRs look like — and what the improved version should include.

### Example A: Layout shift fix

**Minimal submission:**
> Fixed a layout shift on the admin page. Tested, looks correct.

**Improved version:**
> Fixed a layout shift on the admin page caused by the whitelist input loading spinner pushing the mint-asset card downward. Wrapped both action cards in a `min-h-[320px]` container with `items-start`. Verified no shift during loading state on Chrome 126 (375px, 768px, 1440px).
>
> | Before (loading state) | After (loading state) |
> |---|---|
> | ![before](...) | ![after](...) |

### Example B: Color contrast update

**Minimal submission:**
> Updated error text color for WCAG compliance.

**Improved version:**
> Updated transfer error message color from `text-red-400` (#f87171, contrast 3.2:1) to `text-red-600` (#dc2626, contrast 5.8:1) to meet WCAG AA 4.5:1 minimum. Light mode only — dark mode already passes.
>
> | Element | Before | After |
> |---|---|---|
> | Error text (light) | ![before](...) | ![after](...) |
> | Error text (dark) | ![unchanged](...) | ![unchanged](...) |

### Example C: New component

**Minimal submission:**
> Added a badge component for KYC status. Works on the portfolio page.

**Improved version:**
> Added `KycBadge` component showing "Verified" / "Pending" / "Rejected" states. Uses green/amber/red color coding. Integrated into `AssetCard` header.
>
> | State | Screenshot |
> |---|---|
> | Verified | ![verified](...) |
> | Pending | ![pending](...) |
> | Rejected | ![rejected](...) |
>
> Responsive check: badge scales correctly at 375px, 768px, 1440px.

### Example D: Dark mode toggle

**Minimal submission:**
> Added dark mode support. All pages look fine.

**Improved version:**
> Added dark mode toggle via `next-themes`. Swapped hardcoded Tailwind colors for `dark:` variants across 4 components. Toggle button placed in navbar.
>
> | Page | Light | Dark |
> |---|---|---|
> | Home | ![home-light](...) | ![home-dark](...) |
> | Portfolio | ![portfolio-light](...) | ![portfolio-dark](...) |
> | Admin | ![admin-light](...) | ![admin-dark](...) |

---

## 4. Failing-CI Examples

PRs submitted while CI is red — either ignored, unnoticed, or dismissed with a weak justification.

### Minimal submission

> **PR Title:** "Refactor asset fetching hook"
>
> **CI status:** ❌ 2 checks failing
>
> **Author comment:** "Tests pass locally, CI is flaky"
>
> **Failing checks:**
> - `lint` — 4 errors (unused imports, missing dependency in useEffect)
> - `typecheck` — 1 error (wrong prop type in AssetCard)

**Why it fails:**
- "CI is flaky" is not a valid justification when lint and type errors are deterministic
- Author did not investigate or fix the failures before opening the PR
- Forces reviewers to triage CI failures instead of reviewing the actual change

### Improved version

> **PR Title:** "Refactor asset fetching hook"
>
> **CI status:** ✅ All checks passing
>
> **Fixes applied before opening PR:**
> - Removed unused `useCallback` import flagged by lint
> - Added `fetchAssets` to `useEffect` dependency array
> - Updated `AssetCard` props interface to accept `isLoading?: boolean`
>
> **Verification:**
> ```
> npm run lint    → 0 errors, 0 warnings
> npm run typecheck → 0 errors
> npm run test    → 14 passed, 0 failed
> ```

**What makes it better:**
- All CI checks pass before requesting review
- Specific fixes listed for each failure that was resolved
- Terminal output pasted as proof of clean runs
- No reviewer time wasted on avoidable CI issues

### Common failing-CI patterns and how to fix them

| Failure type | Before submitting | After fixing |
|---|---|---|
| **Lint errors** | "Will fix later" | Run `npm run lint -- --fix`, commit result |
| **Type errors** | "Types are wrong / too strict" | Fix types or narrow with proper guards, never use `as any` |
| **Test failures** | "Tests need updating" | Update tests or explain why the old test is no longer valid |
| **Build failures** | "Builds locally" | Rebase on `main`, clean install, re-run build |
| **E2E flakes** | "CI is unreliable" | Re-run once; if it fails again, investigate and fix root cause |

---

## Submission Checklist

Before opening a PR, confirm:

- [ ] **UI changes** include before/after screenshots (light + dark mode if applicable)
- [ ] **Logic changes** include unit tests or a manual test table with input/expected/observed
- [ ] **New components** show screenshots of every visual state (loading, empty, error, populated)
- [ ] **CI is green** — `lint`, `typecheck`, and `test` all pass
- [ ] **PR description** explains _what_ changed, _why_, and _how_ it was verified
- [ ] **No single-line descriptions** — even small fixes need context

---

## Quick Reference

| Red flag | Why it's a problem |
|---|---|
| No screenshots on a UI PR | Reviewer cannot verify the visual change |
| "Tested locally" with no details | Unverifiable — no evidence of what was tested |
| CI is red at PR open | Wastes reviewer time; suggests author didn't check their own work |
| One-line PR description | Leaves reviewer guessing about intent and scope |
| No test file for logic changes | No automated regression protection |
| "Works on my machine" | Ignores environment differences; CI is the source of truth |
