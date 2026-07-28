# Payment-Period Conduct Note

This document sets out conduct expectations for contributors during Aegis Dashboard payment periods — the windows in which completed work is reviewed and compensated through the GrantFox evaluation process. It applies to everyone opening issues, submitting PRs, or commenting on payouts.

> **Disclaimer:** This is a community conduct document and does not modify or supersede the GrantFox evaluation terms or any contributor agreements.

---

## Self-Review Before Payment

All contributors should self-review their own PRs before requesting a payout evaluation:

- Verify that the PR is complete against the issue's acceptance criteria.
- Confirm screenshots or a screen recording are attached for any visible UI change.
- Ensure tests have been added and pass locally.
- Check that CI passes before asking for a review.
- Wait for at least one maintainer review before tagging the PR for payment.

---

## GrantFox Evaluation Process

PR merges do **not** guarantee automatic payment. GrantFox evaluates each contribution against its own quality criteria. The following factors are considered:

- Completeness (did the PR deliver what the issue asked for?)
- Code quality and adherence to project conventions
- Test coverage (unit, integration, or property tests)
- Visual evidence (screenshots, recordings, before/after comparisons)
- CI stability at the time of merge

Contributors who have questions about a specific evaluation should use the GrantFox evaluation thread, not the main project issue tracker or community channels.

---

## Testing & Screenshot Expectations

Every PR should include:

- **Screenshots** showing the before and after state of any UI change. Cover desktop and mobile widths where relevant.
- **Test output** showing that existing and new tests pass (`npm test` output).
- **Commands run** — a single `npm run verify` or equivalent.
- **CI status** — confirmation that all CI checks pass on the PR branch.

PRs without this evidence may be excluded from evaluation.

---

## Prohibited Conduct

The following behaviours are not acceptable during payment periods:

- Repeated complaints about payout timing or amounts in community channels.
- Tagging maintainers or GrantFox evaluators outside of the designated evaluation threads.
- Submitting the same PR to multiple repos or campaigns for duplicate payouts.
- Intentionally vague or hard-to-review PRs that circumvent the checklist requirements.
- Harassment, entitlement, or demands related to payment.

Violations may result in a contribution being excluded from the current evaluation window.

---

## README Link

See the main [README](../README.md) for additional dashboard documentation.
