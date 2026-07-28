---
name: Pull Request
about: Submit a contribution to Aegis Dashboard
title: ''
labels: ''
assignees: ''
---

## Description

<!-- Briefly describe what this PR does and why. -->

## Related Issue

<!-- Link the issue this PR addresses (e.g., Closes #123). -->

## Changes Made

<!-- List the key changes introduced in this PR. -->

-

## Screenshots / Recordings

<!-- For UI changes, attach a screenshot or GIF. Remove this section if not applicable. -->

---

## Reviewer Checklist

> Maintainers: complete the checklist below before approving. See [Reviewer Quality Checklist](../../docs/reviewer-checklist.md) for full guidance.

**PR Hygiene**
- [ ] Branch follows naming convention (`feat/`, `fix/`, `ui/`, `docs/`)
- [ ] PR description explains what and why
- [ ] Issue is linked
- [ ] Single-concern scope

**Implementation Completeness**
- [ ] All acceptance criteria are met
- [ ] Edge cases are handled
- [ ] Feature is complete end-to-end

**Code Quality**
- [ ] Follows component architecture (`pages/`, `components/`, `hooks/`)
- [ ] TypeScript types are explicit (no unwarranted `any`)
- [ ] No dead code or unresolved TODOs

**Styling and Responsiveness**
- [ ] Uses Tailwind utility classes and brand color tokens
- [ ] Mobile-first and responsive

**Testing and Verification**
- [ ] Tests included or justification provided
- [ ] `npm run build` and `npm run lint` pass
- [ ] No regressions introduced

**CI and Security**
- [ ] All CI checks pass
- [ ] No secrets or credentials committed
- [ ] New dependencies are from trusted sources

**Documentation**
- [ ] Relevant docs are updated
- [ ] Breaking changes are documented
