# Contributor Payment Guide

This guide explains GrantFox evaluation and payment expectations for Aegis Dashboard issues. Read this before opening a pull request tied to a GrantFox campaign.

---

## Merge Does Not Guarantee Payment

A PR being merged does not automatically entitle the contributor to payment. GrantFox evaluates each contribution against its own quality criteria:

- Completeness relative to the issue's acceptance criteria.
- Code quality and adherence to project conventions.
- Test coverage and evidence of passing tests.
- Screenshots or recordings for UI changes.
- CI stability at the time of merge.

---

## GrantFox Evaluation Dependency

GrantFox evaluators review the PR's artifacts — the issue link, the PR description, screenshots, test output, and CI status. A PR that is technically merged but lacks this evidence may be excluded from evaluation.

---

## Spam and Repeated Complaints

Repeated submissions of low-effort PRs, complaints about payment timing in community channels, or tagging maintainers outside designated evaluation threads are not acceptable. Review the [Low-Effort PR Examples](low-effort-pr-examples.md) and [Payment-Period Conduct Note](payment-period-conduct.md) for expectations.

---

## Screenshots and Tests

Every PR that modifies UI must include:
- **Before/after screenshots** covering all affected pages and responsive widths.
- **Commands run** (e.g., ) in the PR description.
- **Test output** confirming all existing and new tests pass.

For backend or logic changes, include the test output and a summary of the test approach.

---

## Acceptance Criteria Review

Before marking a PR as ready for review, confirm that all acceptance criteria listed in the issue have been addressed. If any criterion cannot be met, explain why in the PR description.
