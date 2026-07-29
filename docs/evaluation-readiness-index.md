# Evaluation-Readiness Index

> **Applies to:** All contributors to the Aegis Dashboard
> **Last updated:** 2026-07-29

## Purpose

This page is the single entry point for every requirement a contributor must satisfy before their pull request can be evaluated for GrantFox payment. Bookmark it, reference it before every submission, and check off each linked resource as you prepare your PR.

---

## Quick-Reference Table

| Area | Document | What It Covers |
|---|---|---|
| Payment Expectations | [Contributor Payment Guide](contributor-payment-guide.md) | GrantFox evaluation criteria, merge-vs-payment distinction, screenshot and test expectations |
| Testing Standard | [Minimum Testing Standard](testing-standard.md) | Minimum test coverage per area (admin, investor, compliance, wallet, diagnostics) |
| Testing Evidence | [Testing Evidence Requirement](testing-evidence-requirement.md) | What evidence each PR must include (tests, screenshots, commands run) |
| CI Guidance | [CI Guidance](ci-guidance.md) | CI pipeline steps, running checks locally, common failures and fixes |
| Acceptance Criteria Audit | [Acceptance Criteria Audit](acceptance-criteria-audit.md) | How to map each criterion to evidence and verify completeness |
| Self-Assessment | [Contributor Self-Assessment Form](self-assessment-checklist.md) | Pre-submit self-assessment form for contributors |
| Reviewer Checklist | [Reviewer Quality Checklist](reviewer-checklist.md) | What reviewers check before approving a PR |
| Reviewer Evidence | [PR Reviewer Evidence Checklist](pr-reviewer-evidence-checklist.md) | Structured reference for reviewers to verify PR evidence completeness and quality |
| Communication & Conduct | [Payment-Period Conduct](payment-period-conduct.md) | Conduct expectations during payment periods |
| PR Evidence Structure | [PR Evidence Checklist](pr-evidence-checklist.md) | How to structure evidence in the PR description |
| Low-Effort PR Examples | [Low-Effort PR Examples](low-effort-pr-examples.md) | Examples of weak vs. strong PRs |

---

## Pre-Submit Flow

Follow these steps in order before opening a pull request:

### Step 1: Read the Payment Guide
→ [Contributor Payment Guide](contributor-payment-guide.md)

Understand what GrantFox evaluators look for and what constitutes a complete submission.

### Step 2: Review the Testing Standard
→ [Minimum Testing Standard](testing-standard.md) · [Testing Evidence Requirement](testing-evidence-requirement.md)

Ensure your change meets the minimum test coverage for the affected areas.

### Step 3: Run CI Checks Locally
→ [CI Guidance](ci-guidance.md)

Run `npm run verify` (or the individual commands) to confirm your branch is green.

### Step 4: Complete the Self-Assessment Form
→ [Contributor Self-Assessment Form](self-assessment-checklist.md)

Fill out the form and work through every item. Do not skip this step.

### Step 5: Prepare Your PR Description
→ [PR Evidence Checklist](pr-evidence-checklist.md) · [Acceptance Criteria Audit](acceptance-criteria-audit.md)

Structure your PR description with all required evidence and map every acceptance criterion.

### Step 6: Open the PR
→ Paste the PR template, fill in all sections, attach screenshots, and submit.

### Step 7: Verify CI on the PR
→ Wait for all GitHub Actions checks to pass. Fix any failures.

---

## Related Documents

- [Contributing Guide](../CONTRIBUTING.md) — Branch naming, component rules, and review process
- [PR Template](../.github/pull_request_template.md) — Auto-loaded when opening a new PR
- [PR Reviewer Evidence Checklist](pr-reviewer-evidence-checklist.md) — Structured evidence verification checklist for reviewers
- [Architecture Overview](architecture.md) — Component hierarchy and state management
- [Frontend Developer Guide](frontend-guide.md) — Styling conventions and page creation
- [Route Access](route-access.md) — Role-aware route guards and page mapping
- [Troubleshooting](troubleshooting.md) — Common setup and build issues
