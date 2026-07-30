# Aegis Dashboard — Documentation Index

This index organises every file in `docs/` by audience so you can find what you need
without scrolling through the main README.

See [README.md](../README.md) for the project overview and quick-start instructions.

---

## Onboarding

Start here if you are setting up the project for the first time or picking up your
first issue.

| Document | What it covers |
|---|---|
| [architecture.md](architecture.md) | Folder structure, SDK layer, pages-router convention |
| [frontend-guide.md](frontend-guide.md) | Component conventions, Tailwind rules, shared utilities |
| [design-guidelines.md](design-guidelines.md) | Colour palette, spacing scale, typography, accessibility targets |
| [mock-mode.md](mock-mode.md) | Running the dashboard without a live Soroban RPC endpoint |
| [troubleshooting.md](troubleshooting.md) | Common setup failures: Node, Freighter, Next.js |
| [diagnostics.md](diagnostics.md) | The in-app `/diagnostics` page and its "Copy Report" output |
| [route-access.md](route-access.md) | Route guards, role mapping, and mock wallet addresses |

---

## Building Features

Reference material for contributors implementing new functionality.

| Document | What it covers |
|---|---|
| [transaction-components.md](transaction-components.md) | Transfer modal, history table, and operation-type mapping |
| [transaction-review-modal.md](transaction-review-modal.md) | Pre-signature review modal, operation summary mapper, risk notes (Issue #177) |
| [admin-action-receipts.md](admin-action-receipts.md) | Admin operation receipts, explorer links, next actions, limitations (Issue #179) |
| [transaction-history.md](transaction-history.md) | Normalised transaction model, supported operation types, fixture coverage |
| [table-filtering.md](table-filtering.md) | Reusable table filtering, sorting, search, and saved-views pattern |
| [empty-state-components.md](empty-state-components.md) | Reusable `EmptyState` component — variants, props, and usage examples |
| [investor-dashboard.md](investor-dashboard.md) | Portfolio page data flow, mock portfolio shape, SDK assumptions |
| [investor-transfer-eligibility.md](investor-transfer-eligibility.md) | Eligibility checks before transfer submission |
| [investor-transfer-request-flow.md](investor-transfer-request-flow.md) | Request-validation layer: address/amount edge cases, RPC-failure vs. not-whitelisted (Issue #41) |
| [rwa-asset-minting-workflow.md](rwa-asset-minting-workflow.md) | Admin RWA mint workflow: asset selector, compliance pre-check, review, Freighter signing, receipt (Issue #6) |
| [asset-lifecycle-status.md](asset-lifecycle-status.md) | RWA asset lifecycle state machine, transition validation, badge/timeline UI (Issue #30) |
| [investor-onboarding-eligibility.md](investor-onboarding-eligibility.md) | Investor onboarding eligibility page, evaluation precedence, SDK mapping (Issue #28) |
| [admin-role-management-design.md](admin-role-management-design.md) | Admin role resolution, whitelist heuristic, mock admin address |
| [audit-log.md](audit-log.md) | Audit log data model, filtering, safe CSV/JSON export, redaction |
| [compliance-reviewer-workflow.md](compliance-reviewer-workflow.md) | Compliance operator workflow for reviewing investor eligibility |
| [compliance-safe-wording.md](compliance-safe-wording.md) | Compliance-safe wording guidance, shared disclaimer helper, and reviewer checklist |
| [compliance-status-panel.md](compliance-status-panel.md) | Address-level compliance status panel for investor/admin views (Issue #175) |
| [performance-budget-review.md](performance-budget-review.md) | Typed budget threshold evaluation, edge cases, and reviewer checklist |
| [feature-flags.md](feature-flags.md) | Feature flag hook, panel location, flag naming conventions |
| [form-idempotency.md](form-idempotency.md) | Content-derived idempotency key, double-submit guard, TTL |
| [sdk-error-recovery.md](sdk-error-recovery.md) | Error categories, retry policy, compliance wording |
| [environment-mismatch-blocking.md](environment-mismatch-blocking.md) | Full-page blocking screen for wallet network mismatch, data model, edge cases, reviewer checklist |
| [bulk-compliance-review.md](bulk-compliance-review.md) | Bulk compliance table engine, KYC import CSV template |
| [kyc-bulk-import-design.md](kyc-bulk-import-design.md) | KYC bulk import design, field mapping, validation rules |
| [kyc-bulk-import-template.csv](kyc-bulk-import-template.csv) | Example CSV for the bulk import flow |
| [accessibility-checklist.md](accessibility-checklist.md) | WCAG AA targets, keyboard navigation, ARIA patterns |
| [visual-regression-fixture-plan.md](visual-regression-fixture-plan.md) | Target screens, fixture states, viewport coverage, and implementation plan for future visual regression testing |

---

## Review and Payment

Read before opening a pull request tied to a GrantFox-evaluated issue.

| Document | What it covers |
|---|---|
| [contribution-quality-examples.md](contribution-quality-examples.md) | Low-effort, partial, under-tested, failing-CI, and acceptable contribution examples |
| [low-effort-pr-examples.md](low-effort-pr-examples.md) | Additional screenshot and CI-specific anti-patterns |
| [pr-evidence-checklist.md](pr-evidence-checklist.md) | Structured checklist for what every PR description must include |
| [acceptance-criteria-audit.md](acceptance-criteria-audit.md) | Process for mapping each issue criterion to verifiable evidence |
| [testing-evidence-requirement.md](testing-evidence-requirement.md) | What the PR template requires and why |
| [test-first-contribution-guide.md](test-first-contribution-guide.md) | Practical test-first workflow with area-specific patterns and examples |
| [testing-standard.md](testing-standard.md) | Minimum test coverage required per kind of dashboard change |
| [sdk-testing-standard.md](sdk-testing-standard.md) | Minimum test coverage for compliance, KYC, RWA, and SDK-adjacent logic |
| [reviewer-checklist.md](reviewer-checklist.md) | Full review process used on GrantFox-submitted PRs |
| [pr-reviewer-evidence-checklist.md](pr-reviewer-evidence-checklist.md) | Structured checklist for reviewers to verify PR evidence completeness and quality |
| [self-assessment-checklist.md](self-assessment-checklist.md) | Pre-submit self-assessment form for contributors |
| [payment-period-conduct.md](payment-period-conduct.md) | Conduct expectations during GrantFox evaluation windows |
| [contributor-payment-guide.md](contributor-payment-guide.md) | How GrantFox evaluates contributions for compensation |
| [contributor-experience-review.md](contributor-experience-review.md) | Known onboarding friction, documentation gaps, and follow-up issues |

---

## Release

Reference material for preparing or reviewing a production or testnet release.

| Document | What it covers |
|---|---|
| [release-readiness-review.md](release-readiness-review.md) | Security gaps, UX limitations, and open items before production |
| [release-testing-checklist.md](release-testing-checklist.md) | Manual release verification steps |

---

## Infrastructure

Configuration and process documentation.

| Document | What it covers |
|---|---|
| [mock-mode.md](mock-mode.md) | Mock SDK provider, env var setup, fixture data reference |
| [feature-flags.md](feature-flags.md) | Runtime feature flag hook and admin panel |
| [form-idempotency.md](form-idempotency.md) | Client-side idempotency guard on value-moving forms |