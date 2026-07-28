# Aegis Dashboard — GrantFox PR Reviewer Checklist

This checklist provides a repeatable review process for every GrantFox-submitted PR to the Aegis RWA Dashboard. Complete all sections before approving a pull request.

---

## 1. Implementation Verification

- [ ] PR description clearly states what the change does and why
- [ ] Implementation matches the linked issue's requirements and acceptance criteria
- [ ] No unrelated changes, stray logs, or commented-out code are included
- [ ] Branch name follows `CONTRIBUTING.md` conventions
- [ ] No new dependencies added without justification in the PR description
- [ ] Environment variables (if any) are documented in `.env.example`

### Code quality
- [ ] New code follows existing patterns and conventions in the codebase
- [ ] No magic numbers or hardcoded strings — use constants or config where appropriate
- [ ] Error states are handled (loading, empty, error, edge cases)
- [ ] No `console.log` or `debugger` statements left in production code
- [ ] TypeScript types are used — no `any` without explicit justification

### Component review
- [ ] Components are in the correct directory (`/components`, `/app`, etc.)
- [ ] Shared components are extracted rather than duplicated
- [ ] Props are typed with a clearly named interface
- [ ] Components handle both connected and disconnected wallet states where relevant

### Security
- [ ] No private keys, mnemonics, or secrets exposed in client-side code
- [ ] External links use `rel="noreferrer"` with `target="_blank"`
- [ ] User input is validated before being used in transactions or API calls
- [ ] No `eval()` or `dangerouslySetInnerHTML` introduced

---

## 2. Screenshots / Recordings Check

- [ ] PR includes screenshots or screen recordings for all UI changes
- [ ] Screenshots cover both light and dark mode (if theming exists)
- [ ] Mobile/responsive views are shown for layout changes
- [ ] All states are captured: loading, empty, error, success, and edge cases
- [ ] Modals, dropdowns, and tooltips are shown in their open state
- [ ] Before/after comparisons are included for UI refactors

### Recording checklist (if applicable)
- [ ] Screen recording shows full user flow from start to finish
- [ ] Recording demonstrates wallet connection, transaction flow, and disconnection
- [ ] Recording is at a reasonable playback speed (not sped up beyond readability)
- [ ] Recording is embedded or linked, not attached as a large file

---

## 3. Tests and CI Verification

- [ ] All CI checks pass (build, lint, typecheck)
- [ ] `npm run build` completes without TypeScript errors
- [ ] `npm run lint` passes with no warnings or errors
- [ ] New logic has corresponding unit or integration tests (if test framework is set up)
- [ ] Changes to compliance, KYC checks, RWA metadata, investor reads, admin actions, or transaction receipts meet the [Aegis SDK Testing Standard](sdk-testing-standard.md) — check happy-path, negative-path, and fixture coverage, not just presence of a test file
- [ ] `npm test` was run locally and its output is included in the PR (CI does not currently run the test suite — see [Testing Evidence Requirement](testing-evidence-requirement.md))

### Manual testing confirmation
- [ ] Reviewer has pulled the branch and tested locally
- [ ] Feature works on both Stellar testnet and mainnet (if network-dependent)
- [ ] Feature works with Freighter wallet connected and disconnected
- [ ] No regressions in existing functionality observed

### Common failure points

| Check | Command | Expected |
|---|---|---|
| TypeScript | `npm run build` | No errors |
| Lint | `npm run lint` | No warnings or errors |
| Dev server | `npm run dev` | Loads at `http://localhost:3000` |
| Production build | `npm run build && npm start` | Serves correctly |

---

## 4. Accessibility Check

- [ ] All interactive elements (buttons, links, inputs) are keyboard-focusable
- [ ] Tab order follows a logical visual flow
- [ ] Form inputs have associated `<label>` elements or `aria-label` attributes
- [ ] Color is not the only means of conveying information (icons, text accompany color)
- [ ] Error messages are visible, descriptive, and not color-only
- [ ] Modals trap focus when open and close on `Escape`
- [ ] Images have meaningful `alt` text (or `alt=""` if decorative)
- [ ] Heading hierarchy is logical (no skipped levels: h1 → h2 → h3)

### Quick audit commands

```bash
# Check for images missing alt text
grep -r '<img' src/ --include="*.tsx" | grep -v 'alt='

# Check for aria-label on icon-only buttons
grep -r 'aria-label' src/ --include="*.tsx"
```

---

## 5. Acceptance Criteria Review

- [ ] Every acceptance criterion from the linked issue is addressed
- [ ] Criteria that are NOT met are explicitly called out in the PR description with reasoning
- [ ] Edge cases listed in the issue are handled or documented as out of scope

### Cross-browser and device check

| Environment | Status | Notes |
|---|---|---|
| Chrome (latest) | ⬜ | |
| Firefox (latest) | ⬜ | |
| Safari (latest) | ⬜ | |
| Mobile Chrome (Android) | ⬜ | |
| Mobile Safari (iOS) | ⬜ | |
| Tablet (portrait) | ⬜ | |

---

## 6. Documentation

- [ ] `README.md` is updated if setup steps changed
- [ ] `docs/` is updated if architecture, flows, or conventions changed
- [ ] Inline comments explain non-obvious logic (no redundant comments)
- [ ] Changelog or PR description summarizes user-facing impact

---

## Sign-off

| Reviewer | Date | Approved / Changes Requested | Notes |
|---|---|---|---|
| | | | |

PR number: ___________
Linked issue: ___________
Branch reviewed: ___________
