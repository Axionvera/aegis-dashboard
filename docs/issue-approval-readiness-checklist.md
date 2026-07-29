# Issue Approval Readiness Checklist

> **Applies to:** All contributors and reviewers before considering an Aegis Dashboard issue resolved and ready for GrantFox evaluation
> **Last updated:** 2026-07-29

## Purpose

A PR being merged does **not** automatically mean the issue is complete or ready for evaluation. This checklist helps contributors and reviewers verify that every aspect of an issue has been addressed before marking it as approval-ready. Use it as the final gate before requesting GrantFox evaluation.

---

## Important: Merge ≠ Evaluation

Merged PRs are still subject to GrantFox evaluation. Meeting this checklist does not guarantee payment — it ensures your work is reviewable and complete. See the [Contributor Payment Guide](contributor-payment-guide.md) for full details.

---

## Pre-Evaluation Checklist

### 1. Implementation Completeness

- [ ] Every acceptance criterion from the issue is satisfied by the merged PR(s).
- [ ] The implementation handles edge cases (empty states, error boundaries, unexpected input).
- [ ] No `TODO`, `FIXME`, or `HACK` comments related to this issue remain unresolved.
- [ ] The change works end-to-end as described in the issue.
- [ ] If the issue spans multiple PRs, each PR references the same issue and the overall completion is tracked.

### 2. Testing Expectations

- [ ] Tests have been added or updated for every new or changed public method.
- [ ] Test coverage meets the [Minimum Testing Standard](testing-standard.md) for the affected areas.
- [ ] All existing tests pass (`npm test`).
- [ ] For UI changes, screenshots or recordings are attached showing before/after at relevant viewport widths.
- [ ] Negative-path tests exist for error states, invalid inputs, and edge cases.

### 3. CI Status

- [ ] All CI checks pass on the merged PR(s) — lint, type check, build, and tests.
- [ ] No new warnings or errors were introduced by the change.
- [ ] If a CI step failed and was resolved, the root cause and fix are documented.

### 4. Acceptance Criteria Review

- [ ] Every acceptance criterion from the issue is mapped to concrete, verifiable evidence.
- [ ] Evidence points to specific files, test names, or screenshots — not vague statements.
- [ ] No criterion is left unchecked without a documented justification.
- [ ] The PR description includes a traceability table or criteria mapping section.

### 5. Documentation

- [ ] New features or behavioural changes are reflected in the relevant documentation.
- [ ] API changes are documented in the appropriate docs.
- [ ] If the change affects setup, usage, or contribution flow, README is updated.
- [ ] Screenshots or diagrams are included where they aid understanding.

### 6. Known Limitations

- [ ] Any known limitations, trade-offs, or follow-up work are documented in the PR or issue comments.
- [ ] If the issue was intentionally only partially addressed, the remaining work is tracked in a follow-up issue.
- [ ] Performance implications, if any, are noted.

---

## Self-Review Flow

Before requesting GrantFox evaluation:

1. Open the merged PR(s) and verify CI is green.
2. Walk through each section of this checklist.
3. Check off every item. If any item cannot be checked, fix it or document why.
4. Confirm the PR description contains all required evidence (issue reference, acceptance criteria mapping, test output, screenshots).
5. Add a comment on the issue confirming the checklist is complete and requesting evaluation.

---

## Related Documents

- [Contributor Payment Guide](contributor-payment-guide.md) — GrantFox evaluation criteria and merge-vs-payment distinction
- [Self-Assessment Checklist](self-assessment-checklist.md) — Pre-submit review for contributors before opening a PR
- [Acceptance Criteria Audit](acceptance-criteria-audit.md) — Criteria-to-evidence mapping process
- [CI Guidance](ci-guidance.md) — CI pipeline steps and local verification
- [Minimum Testing Standard](testing-standard.md) — Test coverage requirements
- [PR Evidence Checklist](pr-evidence-checklist.md) — PR description structure
- [Reviewer Quality Checklist](reviewer-checklist.md) — What reviewers check
- [Evaluation-Readiness Index](evaluation-readiness-index.md) — Central resource index
