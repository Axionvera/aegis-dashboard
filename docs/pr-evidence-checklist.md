# Pull Request Evidence Checklist

> **Version:** 1.0
> **Last Updated:** 2026-07-28
> **Applies To:** All contributors to the Aegis Dashboard repository

## Purpose

The PR Evidence Checklist ensures that every contribution to the Aegis Dashboard is well-documented, thoroughly tested, and clearly traceable back to a tracked issue. By standardizing the evidence that accompanies each pull request, we achieve:

- **Objective reviews** — Reviewers can evaluate PRs against a consistent set of criteria rather than relying on subjective judgment.
- **Accountability** — Contributors demonstrate that their work meets the acceptance criteria defined in the linked issue.
- **Quality assurance** — Every change is validated locally before review, reducing the likelihood of regressions reaching the main branch.
- **Knowledge sharing** — Future contributors can reference merged PRs to understand the rationale behind past changes.

---

## Checklist Overview

Every pull request submitted to this repository must include evidence for the following six categories:

| # | Category                     | Purpose                                                      |
|---|------------------------------|--------------------------------------------------------------|
| 1 | Issue Reference              | Links the PR to a tracked issue for traceability             |
| 2 | Implementation Summary       | Explains what changed, why, and which files were affected     |
| 3 | Testing                      | Proves the changes are covered by tests or justifies why not |
| 4 | Commands Run                 | Shows the contributor validated the change locally            |
| 5 | CI Status                    | Confirms automated checks pass without new issues            |
| 6 | Acceptance Criteria Coverage | Maps each acceptance criterion to supporting evidence         |

---

## Detailed Requirements

### 1. Issue Reference

Every PR must reference at least one open issue. Use GitHub closing keywords to auto-close the issue upon merge:

```
Closes #125
Fixes #42
Resolves #88
```

**Why this matters:** Unlinked PRs create orphaned work that is difficult to trace during audits, retrospectives, or when debugging regressions.

**What to do if there is no issue:** Open an issue first, describe the problem or feature, then reference it in the PR. Ad-hoc PRs without issue references will not be accepted.

### 2. Implementation Summary

Provide a clear, concise summary that answers:

- **What** was changed?
- **Why** was the change necessary?
- **Which files** were added, modified, or removed?

A good implementation summary enables reviewers to understand the scope of the PR without reading every line of the diff first.

**Example:**

> Added a PR evidence checklist template and updated the contribution guide to require structured evidence with every pull request. This addresses the lack of standardized review criteria described in #125.
>
> **Files Changed:**
> - `.github/PULL_REQUEST_TEMPLATE.md` (added)
> - `docs/pr-evidence-checklist.md` (added)
> - `CONTRIBUTING.md` (updated)
> - `README.md` (updated)

### 3. Testing

Contributors must demonstrate that their changes are tested:

- **If tests were added or updated:** List the test files and describe what they cover.
- **If tests are not applicable:** Provide a brief justification (e.g., documentation-only changes, CI configuration changes).

Changes to admin workflows, investor views, compliance screens, asset registration, minting, wallet connection, or diagnostics must meet the [Aegis Dashboard Minimum Testing Standard](testing-standard.md). Changes to compliance, KYC checks, RWA metadata, investor reads, admin actions, or transaction receipts must additionally meet the [Aegis SDK Testing Standard](sdk-testing-standard.md), which defines the minimum unit, integration, and negative-path coverage per area — "list the test files" is not sufficient on its own for these areas.

**Acceptable justifications for skipping tests:**
- Documentation-only changes with no testable logic
- CI/CD pipeline configuration changes (validated by the pipeline itself)
- Dependency version bumps with no API changes (verified by existing test suite)

**Unacceptable justifications:**
- "Will add tests later"
- "Tests are too hard to write for this"
- No justification at all

### 4. Commands Run

List the exact commands you executed locally to validate the change. At a minimum, every PR should demonstrate:

```bash
npm install       # Ensure dependencies resolve cleanly
npm run lint      # Verify no linting errors
npm run build     # Confirm the project compiles successfully
npm run dev       # Verify the development server starts
```

For PRs that include test files:

```bash
npm test          # Run the test suite
```

**Include output or screenshots** where the command results are not obvious (e.g., a passing test summary, a successful build log).

### 5. CI Status

Before requesting a review:

- Confirm that all CI checks triggered by the PR are passing.
- If a CI check fails for a reason unrelated to your changes, document it in the **Reviewer Notes** section and link to the failing job.

**Do not** request a review while CI checks are still running or failing without explanation.

### 6. Acceptance Criteria Coverage

Every issue in this repository includes acceptance criteria. Your PR must explicitly map each criterion to evidence that it has been satisfied.

**Format:**

| Acceptance Criterion                              | Evidence                                              |
|---------------------------------------------------|-------------------------------------------------------|
| PR checklist requires issue reference              | Template includes mandatory issue reference field      |
| PR checklist requires implementation summary       | Template includes description and files changed section|
| PR checklist requires tests or justification       | Template includes testing section with justification   |

**Why this matters:** Simply checking a box is not sufficient. The mapping table forces contributors to think critically about whether each criterion has actually been met.

---

## Using the PR Template

The PR template (`.github/PULL_REQUEST_TEMPLATE.md`) is automatically loaded when you open a new pull request on GitHub. It contains the full evidence checklist with placeholder instructions.

**Steps:**

1. Open a new pull request on GitHub.
2. The template will be pre-populated in the PR description.
3. Replace each placeholder with your actual evidence.
4. Check each box as you complete it.
5. If a section is not applicable, replace the placeholder with a brief justification.
6. Request a review only after all applicable sections are complete and CI passes.

---

## Review Process

Reviewers should use the evidence checklist as a structured guide:

1. **Verify the issue reference** — Confirm the linked issue exists and the PR addresses its scope.
2. **Read the implementation summary** — Ensure it matches the actual diff.
3. **Check testing evidence** — Verify tests exist or the justification is acceptable.
4. **Validate commands run** — Confirm the contributor ran the minimum required commands.
5. **Check CI status** — Ensure all checks are green before approving.
6. **Audit the acceptance criteria table** — Confirm each criterion is mapped to real evidence.

PRs that do not satisfy the checklist should be sent back with a clear explanation of what is missing.

---

## Frequently Asked Questions

**Q: My PR is a one-line typo fix. Do I still need the full checklist?**
A: Yes. The checklist is lightweight for small changes — most sections will be a single sentence. Consistency matters more than the size of the change.

**Q: What if the issue does not have acceptance criteria?**
A: Ask the issue author or a maintainer to add acceptance criteria before starting work. If you are the issue author, define the criteria yourself and get sign-off before submitting the PR.

**Q: Can I leave checklist items unchecked?**
A: Only if you provide a justification in the corresponding section. Unchecked items without justification will block the review.

---

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md) — Branch naming, component rules, and workflow
- [Aegis Dashboard Minimum Testing Standard](./testing-standard.md) — Minimum test coverage expected for admin workflows, investor views, compliance screens, asset registration, minting, wallet connection, and diagnostics
- [Aegis SDK Testing Standard](./sdk-testing-standard.md) — Minimum test coverage expected for compliance, KYC, RWA metadata, investor reads, admin actions, and transaction receipts
- [Architecture Overview](./architecture.md) — Component hierarchy and state management
- [Frontend Developer Guide](./frontend-guide.md) — Styling conventions and page creation
- [Acceptance Criteria Audit](./acceptance-criteria-audit.md) — Process for mapping each criterion to verifiable evidence
