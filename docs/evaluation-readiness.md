# Aegis Dashboard Evaluation-Readiness Dashboard

This document provides a single, central dashboard summarizing all requirements and verification steps necessary to ensure a pull request is fully evaluation-ready. Contributors should review and complete this checklist prior to marking a PR as ready for review or submitting it for payment evaluation.

---

## 1. Overview and Core Purpose

Contributor expectations in the Aegis Dashboard repository span testing standards, CI configurations, PR evidence templates, and payment conduct guidelines. This evaluation-readiness dashboard consolidates those requirements into one structured workflow.

Before requesting maintainer review or payment evaluation, every pull request must satisfy six core evaluation criteria:

1. **Issue Traceability** — Linked to an open GitHub issue using closing keywords.
2. **Automated Testing** — Compliant with dashboard and SDK testing standards.
3. **Green CI Pipeline** — All automated checks passing in GitHub Actions.
4. **Structured PR Evidence** — Complete evidence checklist filled out in the PR description.
5. **Acceptance Criteria Mapping** — Explicit 1-to-1 mapping of issue acceptance criteria to delivered implementation.
6. **Conduct and Self-Review** — Adherence to payment period conduct guidelines and self-review protocols.

---

## 2. Evaluation Readiness Scorecard

Use this matrix to audit your pull request before requesting maintainer review:

| Evaluation Dimension | Readiness Requirement | Authoritative Source Document | Verification Method |
|---|---|---|---|
| **Testing Standard** | Unit, integration, and negative-path test coverage meeting area-specific requirements | [Dashboard Testing Standard](testing-standard.md) & [SDK Testing Standard](sdk-testing-standard.md) | `npm test` output attached to PR |
| **CI Workflow** | Green status across linting, type checking, unit tests, and production build | [CI Workflow Configuration](../.github/workflows/ci.yml) & [Testing Evidence Policy](testing-evidence-requirement.md) | GitHub Actions status checks green |
| **PR Evidence** | All 6 evidence categories completed with no placeholders or blank fields | [PR Evidence Checklist](pr-evidence-checklist.md) & [PR Template](../.github/pull_request_template.md) | PR description audit |
| **Acceptance Criteria** | Explicit mapping table linking every issue criterion to delivered evidence | [PR Evidence Checklist - Section 6](pr-evidence-checklist.md#6-acceptance-criteria-coverage) & [Low-Effort PR Examples](low-effort-pr-examples.md) | Criteria mapping table in PR |
| **Payment Conduct** | Adherence to evaluation rules, self-review protocol, and community standards | [Payment-Period Conduct Note](payment-period-conduct.md) & [Contributor Payment Guide](contributor-payment-guide.md) | Contributor self-review |

---

## 3. Testing Standards Integration

Every pull request modifying application code must satisfy the repo's testing standards:

- **Dashboard Testing Standard**: Governs UI components, admin workflows, investor views, compliance screens, asset registration, minting, wallet connection, and diagnostics. See [Aegis Dashboard Minimum Testing Standard](testing-standard.md).
- **SDK Testing Standard**: Governs compliance logic, KYC checks, RWA metadata parsing, investor read models, admin provider calls, and transaction receipts. See [Aegis SDK Minimum Testing Standard](sdk-testing-standard.md).

### Minimum Required Coverage by Feature Area

- **Admin Workflows**: Input validation, state derivation, role-gate permissions, provider rejections.
- **Investor Views**: Loading, empty, error, and populated rendering states.
- **Compliance Screens**: Status-to-badge mapping for verified, pending, review-flagged, and rejected verdicts.
- **Asset Registration**: Card rendering, metadata parsing error boundaries, transfer eligibility.
- **Wallet Connection**: Connect, disconnect, and auto-reconnect state transitions and extension errors.

---

## 4. CI Workflow and Verification Pipeline

All pull requests are evaluated against the automated CI pipeline configured in [.github/workflows/ci.yml](../.github/workflows/ci.yml).

### Required Local Command Sequence

Run the complete local verification suite before pushing:

```bash
npm run lint       # ESLint validation (must return 0 errors)
npm run typecheck  # TypeScript static analysis (must return 0 errors)
npm test           # Vitest suite (all test files must pass)
npm run build      # Next.js production build (must compile successfully)
```

For detailed guidance on evidence expectations for commands run and CI status, consult the [Testing Evidence Requirement](testing-evidence-requirement.md).

---

## 5. PR Evidence Checklist and Template Usage

A pull request description must not use default text or unverified checkmarks. The PR description template is located at [.github/pull_request_template.md](../.github/pull_request_template.md) and described in detail in the [PR Evidence Checklist](pr-evidence-checklist.md).

### Required Evidence Sections

1. **Issue Reference**: Explicit reference using `Closes #NNN`, `Fixes #NNN`, or `Resolves #NNN`.
2. **Implementation Summary**: Concise description of changes, rationale, and list of modified files.
3. **Testing Output**: Summary or log snippet of `npm test` demonstrating clean execution.
4. **Commands Run**: List of local validation commands executed (`lint`, `typecheck`, `test`, `build`).
5. **CI Status**: Explicit confirmation that GitHub Actions pipeline is passing.
6. **Acceptance Criteria Coverage**: Mapping table demonstrating fulfillment of issue criteria.

---

## 6. Acceptance Criteria Mapping Protocol

Submitting a PR with unaddressed acceptance criteria or vague claims of completeness is a primary cause of review failure. Follow the [Acceptance Criteria Audit](acceptance-criteria-audit.md) for the full mapping process. Refer to [Low-Effort PR Examples](low-effort-pr-examples.md) to understand common anti-patterns.

### Acceptance Criteria Mapping Template

Include a table formatted as follows in your PR description:

| Issue Acceptance Criterion | Implementation Details / File Reference | Verification / Evidence |
|---|---|---|
| Evaluation-readiness summary page is added | Added `docs/evaluation-readiness.md` | Document created and linked |
| Testing standard is linked | Linked in Section 3 of dashboard | Verified links resolve |
| CI workflow is linked | Linked in Section 4 of dashboard | Verified links resolve |
| PR evidence checklist is linked | Linked in Section 5 of dashboard | Verified links resolve |
| Acceptance criteria mapping is linked | Linked in Section 6 of dashboard | Verified links resolve |
| Payment-period conduct guidance is linked | Linked in Section 7 of dashboard | Verified links resolve |

---

## 7. Payment-Period Conduct and Self-Review

During payment evaluation windows, contributors must follow the guidelines detailed in the [Payment-Period Conduct Note](payment-period-conduct.md) and the [Contributor Payment Guide](contributor-payment-guide.md).

### Self-Review Checklist Before Payment Evaluation

Before requesting payment evaluation or maintainer sign-off:

- [ ] Issue is explicitly closed in PR description (`Closes #NNN`).
- [ ] No emojis are present in any updated code, comments, or documentation files.
- [ ] Automated tests cover all new branching paths and edge cases.
- [ ] Visual UI changes include before/after screenshots across desktop and mobile viewports.
- [ ] Local verification suite (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`) completed cleanly.
- [ ] GitHub Actions CI status is fully green.
- [ ] No prohibited conduct (maintainer spamming, duplicate PR submissions, unverified claims).

---

## 8. Summary of Linked Resources

| Resource | Document Path | Primary Audience / Purpose |
|---|---|---|
| Dashboard Testing Standard | [docs/testing-standard.md](testing-standard.md) | Minimum test expectations for UI and feature areas |
| SDK Testing Standard | [docs/sdk-testing-standard.md](sdk-testing-standard.md) | Coverage rules for SDK, compliance, and read models |
| CI Workflow File | [.github/workflows/ci.yml](../.github/workflows/ci.yml) | GitHub Actions CI configuration |
| Testing Evidence Requirement | [docs/testing-evidence-requirement.md](testing-evidence-requirement.md) | Policy governing test evidence submission |
| PR Evidence Checklist | [docs/pr-evidence-checklist.md](pr-evidence-checklist.md) | Detailed requirements for PR description evidence |
| PR Description Template | [.github/pull_request_template.md](../.github/pull_request_template.md) | Markdown template loaded on PR creation |
| Low-Effort PR Examples | [docs/low-effort-pr-examples.md](low-effort-pr-examples.md) | Anti-patterns and examples of invalid PRs |
| Payment-Period Conduct Note | [docs/payment-period-conduct.md](payment-period-conduct.md) | Community conduct rules during payment cycles |
| Contributor Payment Guide | [docs/contributor-payment-guide.md](contributor-payment-guide.md) | Payout evaluation criteria and expectations |
