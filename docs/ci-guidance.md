# CI Guidance

> **Applies to:** All contributors to the Aegis Dashboard
> **Last updated:** 2026-07-29

## Overview

The Aegis Dashboard uses GitHub Actions for continuous integration. Every pull request triggers automated checks that must pass before merging.

## CI Workflow

The CI pipeline is defined in `.github/workflows/ci.yml` and runs on every pull request and push to `main`:

| Step | Command | Purpose |
|---|---|---|
| Lint | `npm run lint` | Enforces ESLint rules and code style |
| Type check | `npx tsc --noEmit` | Verifies TypeScript compilation without emitting files |
| Build | `npm run build` | Ensures the Next.js application builds successfully |

## Running CI Checks Locally

Before pushing, run the same checks locally to catch issues early:

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build

# Tests
npm test

# Full verification (build + lint + type check)
npm run verify
```

## Common CI Failures and Fixes

| Failure | Likely Cause | How to Fix |
|---|---|---|
| Lint error | ESLint rule violation | Run `npm run lint` and fix reported issues |
| TypeScript error | Type mismatch, missing type | Fix the type error or add proper type annotations |
| Build failure | Syntax error, missing import, broken module | Check build output for specific error messages |
| Test failure | Assertion failure, broken test | Run `npm test` locally and debug the failing test |

## CI Status on PRs

- All CI checks must be **green** before a PR can be merged.
- If a CI step fails, investigate the root cause and push a fix.
- Pre-existing failures unrelated to your change should be noted in the PR description.
- If CI is flaky (e.g., a timeout), you may re-run the failed job from the Actions tab.

## Related

- [Testing Standard](testing-standard.md) — minimum test coverage expectations
- [Testing Evidence Requirement](testing-evidence-requirement.md) — evidence required in PRs
- [PR Evidence Checklist](pr-evidence-checklist.md) — PR description structure
