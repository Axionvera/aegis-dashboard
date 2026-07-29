# Contributor Self-Assessment Form

> **Applies to:** All contributors before submitting a pull request to the Aegis Dashboard
> **Last updated:** 2026-07-29

## Purpose

This self-assessment form helps contributors evaluate their own work before requesting a maintainer review. Completing this form reduces review cycles, catches common issues early, and ensures GrantFox evaluation readiness.

## Instructions

1. Fill in your contributor information below.
2. Work through every item in the pre-submit checklist and mark it complete.
3. Complete the declaration.
4. Attach a copy of this completed form to your pull request or paste it into the "Reviewer Notes" section of the PR description.

---

## Contributor Information

```
Contributor: _________________________
Date: _______________________________
Issue Number: _______________________
Branch Name: ________________________
```

---

## Pre-Submit Checklist

### Scope and Completeness

- [ ] The PR addresses a single, well-defined issue.
- [ ] Every acceptance criterion from the linked issue is addressed.
- [ ] The PR title and description clearly explain what changed and why.
- [ ] No unrelated changes are included in the diff.

### Code Quality

- [ ] Code follows the project's TypeScript conventions (no `any` without justification).
- [ ] Components follow the project hierarchy (pages in `src/pages/`, UI in `src/components/`, hooks in `src/hooks/`).
- [ ] No hardcoded values — magic numbers, URLs, and config are extracted into constants or env vars.
- [ ] State is kept as local as possible; global state (Zustand) is used only when necessary.
- [ ] New components are responsive (mobile-first via Tailwind).

### Testing

- [ ] Tests have been added or updated for every new or changed public method.
- [ ] All existing tests pass locally (`npm test`).
- [ ] Test coverage meets the [Minimum Testing Standard](testing-standard.md) for the affected areas.
- [ ] Screenshots or recordings are attached for UI changes (before/after, desktop + mobile widths).

### Documentation

- [ ] New features or changes to existing behaviour are documented.
- [ ] API changes are reflected in the relevant docs.
- [ ] README is updated if the change affects the setup, usage, or contribution flow.

### CI and Build

- [ ] `npm run lint` passes with no errors.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `npm run build` completes successfully.
- [ ] `npm test` passes with no failures.

### PR Description

- [ ] Issue reference is included (`Closes #N` or `Relates to #N`).
- [ ] Implementation summary describes what changed and why.
- [ ] "Commands Run" section includes terminal output.
- [ ] "Acceptance Criteria Coverage" section maps each criterion to evidence.
- [ ] Screenshots section is populated for UI changes.

---

## Declaration

By completing this form, I confirm that:

- I have reviewed every item in the pre-submit checklist above.
- My work addresses each acceptance criterion in the linked issue.
- I have run the local verification commands and all checks pass.
- I understand that incomplete or inaccurate self-assessments may delay the review process.

---

## Post-Submit Verification

After opening the PR:

- [ ] Verify CI checks pass on the PR.
- [ ] If a check fails, investigate and push a fix promptly.
- [ ] If the PR is documentation-only, ensure the "Tests not applicable" justification is filled in.

---

## Related

- [Reviewer Checklist](reviewer-checklist.md) — what reviewers will check
- [PR Evidence Checklist](pr-evidence-checklist.md) — PR description requirements
- [Acceptance Criteria Audit](acceptance-criteria-audit.md) — criteria verification process
- [Evaluation-Readiness Index](evaluation-readiness-index.md) — central resource index
