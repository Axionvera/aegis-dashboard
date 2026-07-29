# Acceptance Criteria Audit

> **Applies to:** All contributors and reviewers of the Aegis Dashboard
> **Last updated:** 2026-07-29

## Purpose

An acceptance criteria audit ensures that every requirement listed in an issue has been demonstrably satisfied by the pull request. This process makes GrantFox evaluation straightforward and prevents incomplete work from being merged.

## Audit Process

Before marking a PR as ready for review, complete the following steps:

### 1. Copy the Criteria

Copy every acceptance criterion from the linked issue verbatim into the PR description's "Acceptance Criteria Coverage" section.

### 2. Map Each Criterion to Evidence

For each criterion, provide concrete evidence of how it was met:

| Criterion | Evidence | File / Location |
|---|---|---|
| _Criterion from issue_ | _How the PR satisfies it_ | _Specific file path or URL_ |

Examples of evidence:
- **New file created:** `docs/evaluation-readiness-index.md`
- **Existing file modified:** `README.md` updated with new link
- **Test added:** `tests/feature.test.ts` covers the new behaviour
- **Screenshot:** UI change is visible in the attached screenshot

### 3. Verify Completeness

- Every criterion must have at least one piece of evidence.
- If a criterion is partially satisfied, explain what remains and why.
- If a criterion is intentionally not addressed, state the reason and reference any follow-up issue.

### 4. Self-Check

Run through these questions before requesting review:

- [ ] Every acceptance criterion from the issue is listed in the PR description.
- [ ] Each criterion has a clear, verifiable piece of evidence.
- [ ] Evidence points to specific files, test names, or screenshots — not vague statements.
- [ ] No criterion is left unchecked without a justification.
- [ ] The PR title and description accurately reflect the scope of work.

## Reviewer's Audit

Reviewers should verify:

- [ ] The PR description lists all acceptance criteria from the linked issue.
- [ ] Each criterion has evidence that actually demonstrates compliance.
- [ ] Evidence is specific (file paths, test names, screenshots) — not generic claims.
- [ ] No criterion is silently skipped or glossed over.

## Related

- [PR Evidence Checklist](pr-evidence-checklist.md) — how evidence is structured
- [Reviewer Checklist](reviewer-checklist.md) — reviewer evaluation criteria
- [Self-Assessment Checklist](self-assessment-checklist.md) — pre-submit review
- [Evaluation-Readiness Index](evaluation-readiness-index.md) — central resource index
