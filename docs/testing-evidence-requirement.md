# Testing Evidence Requirement

Every pull request that modifies application behavior must include testing evidence. This policy exists so reviewers can independently verify that changes work as intended without having to pull and run the branch locally.

## Required Evidence

| Item | Why |
|---|---|
| **Affected pages list** | Gives reviewers a map of what to check — reduces time spent hunting for change surface area. |
| **Tests added** | Automated regression protection. If the change touches existing behavior, existing tests must still pass; new paths need new coverage. |
| **Screenshots / recordings** | Visual proof that the UI renders correctly at common viewport sizes. Recordings for interactive flows (form submissions, modals, navigation). |
| **Commands run** | Seed scripts, migrations, or one-off setup steps the reviewer needs to reproduce the testing environment. If none were needed, check the box and note "N/A". |
| **CI status** | Green CI signals that the branch builds, lints, and passes the full test suite. Red CI must be addressed before merging. |

## When This Applies

- All PRs that touch `src/` files.
- Documentation-only PRs and trivial fixes (typos, formatting) may skip screenshots/recordings at the author's discretion, but CI and the checklist must still be completed.
- PRs touching compliance, KYC checks, RWA metadata, investor reads, admin actions, or transaction receipts must additionally meet the [Aegis SDK Testing Standard](sdk-testing-standard.md), which specifies minimum unit, integration, negative-path, and fixture coverage per area, plus guidance on when skipping tests is (and isn't) acceptable.

## Template

The PR description template lives at `.github/pull_request_template.md`. It is rendered automatically when a new PR is opened.
