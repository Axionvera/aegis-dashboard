# Reviewer Quality Checklist

A standardized checklist for **Aegis Dashboard** maintainers to evaluate pull requests before merging. This guide ensures every contribution meets the project's quality, reliability, and compliance standards.

---

## How to Use This Checklist

1. Open the pull request and review the description for context.
2. Work through each section below in order.
3. Mark each item as **Pass**, **Fail**, or **N/A**.
4. A PR is merge-ready only when every applicable item passes.
5. If any item fails, leave a clear, constructive comment explaining what needs to change.

> **Tip:** Copy the [Quick-Reference Checklist](#quick-reference-checklist) into your review comment for easy tracking.

---

## 1. PR Hygiene

| # | Check | Details |
|---|-------|---------|
| 1.1 | **Branch naming** | Branch follows convention: `feat/`, `fix/`, `ui/`, or `docs/`. |
| 1.2 | **PR description** | Description clearly explains *what* changed and *why*. |
| 1.3 | **Issue reference** | PR links to a relevant GitHub issue (e.g., `Closes #123`). |
| 1.4 | **Scope** | PR addresses a single concern. Large changes are split into reviewable units. |
| 1.5 | **No unrelated changes** | Diff contains only changes relevant to the stated purpose. |

---

## 2. Implementation Completeness

| # | Check | Details |
|---|-------|---------|
| 2.1 | **Acceptance criteria** | Every acceptance criterion listed in the linked issue is satisfied. |
| 2.2 | **Edge cases** | Implementation handles empty states, error boundaries, and unexpected input. |
| 2.3 | **No TODO/FIXME debt** | New `TODO` or `FIXME` comments are either resolved or tracked in a follow-up issue. |
| 2.4 | **Feature completeness** | The feature works end-to-end as described; no partial implementations are merged without an explicit plan. |

---

## 3. Code Quality

| # | Check | Details |
|---|-------|---------|
| 3.1 | **Readability** | Code is self-documenting with clear variable and function names. |
| 3.2 | **Component architecture** | New components follow the project hierarchy: pages in `src/pages/`, reusable UI in `src/components/`, hooks in `src/hooks/`. |
| 3.3 | **State management** | State is kept as local as possible. Global state (via Zustand) is used only when genuinely required. |
| 3.4 | **No hardcoded values** | Magic numbers, URLs, and configuration are extracted into constants or environment variables. |
| 3.5 | **TypeScript usage** | Types are explicit and meaningful. `any` is avoided unless justified with a comment. |
| 3.6 | **No dead code** | Unused imports, variables, functions, and commented-out blocks are removed. |

---

## 4. Styling and Responsiveness

| # | Check | Details |
|---|-------|---------|
| 4.1 | **Tailwind conventions** | Styling uses Tailwind utility classes. Custom CSS in `globals.css` is avoided unless absolutely necessary. |
| 4.2 | **Brand consistency** | Brand colors use the project tokens: `bg-aegis-brand`, `text-aegis-dark`, `text-aegis-accent`. |
| 4.3 | **Mobile-first design** | UI is responsive and follows a mobile-first approach via Tailwind breakpoints. |
| 4.4 | **Visual evidence** | PR includes a screenshot or GIF demonstrating the UI change (required for all visual PRs). |

---

## 5. Testing and Verification

| # | Check | Details |
|---|-------|---------|
| 5.1 | **Test coverage** | New logic includes unit or integration tests, or the PR explains why tests are not applicable. |
| 5.2 | **Manual verification** | The reviewer has pulled the branch locally and verified the feature works as described. |
| 5.3 | **Regression check** | Existing functionality is not broken by the change. |
| 5.4 | **Build succeeds** | `npm run build` completes without errors. |
| 5.5 | **Lint passes** | `npm run lint` reports no new warnings or errors. |

---

## 6. CI and Pipeline Status

| # | Check | Details |
|---|-------|---------|
| 6.1 | **CI passes** | All automated checks (linting, type-checking, tests) are green. |
| 6.2 | **No ignored failures** | CI failures are investigated and resolved, not dismissed or skipped. |
| 6.3 | **Workflow integrity** | Changes to `.github/` workflow files are reviewed for correctness and do not weaken existing checks. |

---

## 7. Security and Sensitive Data

| # | Check | Details |
|---|-------|---------|
| 7.1 | **No secrets** | No API keys, private keys, mnemonics, or credentials are committed. |
| 7.2 | **Environment variables** | Sensitive configuration uses environment variables, not hardcoded values. |
| 7.3 | **Dependency safety** | New dependencies are from trusted sources and do not introduce known vulnerabilities. |
| 7.4 | **Input validation** | User-facing inputs are validated and sanitized where applicable. |

---

## 8. Documentation

| # | Check | Details |
|---|-------|---------|
| 8.1 | **Inline documentation** | Complex logic includes comments explaining *why*, not *what*. |
| 8.2 | **Updated docs** | If the change affects setup, configuration, or architecture, the relevant docs (`README.md`, `docs/`) are updated. |
| 8.3 | **Breaking changes** | Any breaking changes are clearly documented in the PR description. |

---

## Quick-Reference Checklist

Copy this into your PR review comment for convenient tracking:

```markdown
### Reviewer Checklist

**PR Hygiene**
- [ ] Branch follows naming convention (`feat/`, `fix/`, `ui/`, `docs/`)
- [ ] PR description explains what and why
- [ ] Issue is linked
- [ ] Single-concern scope
- [ ] No unrelated changes

**Implementation Completeness**
- [ ] All acceptance criteria are met
- [ ] Edge cases are handled
- [ ] No unresolved TODO/FIXME items
- [ ] Feature is complete end-to-end

**Code Quality**
- [ ] Readable and self-documenting
- [ ] Follows component architecture (`pages/`, `components/`, `hooks/`)
- [ ] State management is appropriate
- [ ] No hardcoded values
- [ ] TypeScript types are explicit
- [ ] No dead code

**Styling and Responsiveness**
- [ ] Uses Tailwind utility classes
- [ ] Uses brand color tokens
- [ ] Mobile-first and responsive
- [ ] Screenshot/GIF provided for UI changes

**Testing and Verification**
- [ ] Tests included or justification provided
- [ ] Manually verified by reviewer
- [ ] No regressions introduced
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

**CI and Pipeline**
- [ ] All CI checks pass
- [ ] No ignored failures
- [ ] Workflow file changes reviewed

**Security**
- [ ] No secrets or credentials committed
- [ ] Sensitive config uses env variables
- [ ] New dependencies are trustworthy
- [ ] Inputs are validated

**Documentation**
- [ ] Complex logic is commented
- [ ] Relevant docs are updated
- [ ] Breaking changes are documented
```

---

## Review Outcomes

After completing the checklist, apply one of the following outcomes:

| Outcome | When to Use |
|---------|-------------|
| **Approve** | All applicable items pass. The PR is ready to merge. |
| **Request Changes** | One or more items fail. Leave specific, actionable feedback for each failure. |
| **Comment** | The reviewer has questions or suggestions but is not blocking the merge. |

---

## Escalation

If a PR introduces architectural changes, new dependencies, or modifications to CI workflows, request a second review from another maintainer before merging.

---

*This checklist is a living document. If you identify a gap or improvement, open an issue or PR to update it.*
