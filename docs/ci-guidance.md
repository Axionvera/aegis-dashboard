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
| Test | `npm test` | Runs the Vitest test suite |
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
## CI Pass Requirement

A pull request satisfies the CI pass requirement only when all four checks — **Lint**, **Type check**, **Test**, and **Build** — report a green (passing) status in GitHub Actions.

| # | Requirement | Detail |
|---|-------------|--------|
| 1 | **All checks green** | Every CI step must pass before the PR can be merged. A red check in any step blocks merging regardless of the reason. |
| 2 | **No ignored failures** | CI failures must be investigated and resolved. Do not dismiss or skip a failing check without a fix. |
| 3 | **Pre-existing failures** | If a failure pre-exists on `main` and is unrelated to your change, note it in the PR description's **Reviewer Notes** section with a reference to the failing run. The failure must still be resolved before merge. |
| 4 | **Flaky infrastructure** | If a step fails due to a timeout or infrastructure issue (not a code defect), re-run the failed job from the Actions tab. Document repeated flakiness in a GitHub issue. |
| 5 | **CI status in PR evidence** | The PR description must confirm CI status under the **CI Status** section of the [PR Evidence Checklist](pr-evidence-checklist.md). Do not request review while CI checks are still running or failing. |

### Relationship to local verification

Running the same four steps locally before pushing is the primary way to keep CI green. See [Running CI Checks Locally](#running-ci-checks-locally) above and the local verification commands in [CONTRIBUTING.md](../CONTRIBUTING.md#before-you-push).

## Related

- [Testing Standard](testing-standard.md) — minimum test coverage expectations
- [Testing Evidence Requirement](testing-evidence-requirement.md) — evidence required in PRs
- [PR Evidence Checklist](pr-evidence-checklist.md) — PR description structure
- [Evaluation-Readiness Dashboard](evaluation-readiness.md) — central PR readiness scorecard
