# Contributing to Aegis Dashboard

We love open-source contributions! To ensure a smooth and productive process, please follow the guidelines below.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Naming](#branch-naming)
- [Component Rules](#component-rules)
- [Pull Request Evidence Checklist](#pull-request-evidence-checklist)
- [Review and Merge Process](#review-and-merge-process)

---

## Getting Started

1. Fork the repository and clone your fork locally.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a new branch from `main` using the naming conventions below.
4. Make your changes, then push and open a pull request.

---

## Branch Naming

Use descriptive prefixes to categorize your work:

| Prefix   | Purpose                             | Example                        |
|----------|-------------------------------------|--------------------------------|
| `feat/`  | New features or functionality       | `feat/portfolio-export`        |
| `fix/`   | Bug fixes                           | `fix/wallet-connection-error`  |
| `ui/`    | UI/UX improvements                  | `ui/responsive-navbar`         |
| `docs/`  | Documentation changes               | `docs/pr-evidence-checklist`   |
| `refactor/` | Code restructuring               | `refactor/state-management`    |
| `ci/`    | CI/CD pipeline changes              | `ci/add-lint-workflow`         |

---

## Component Rules

- All new UI components must be **fully responsive** using a mobile-first approach with Tailwind CSS.
- Place reusable components in `src/components/` and page-level components in `src/pages/`.
- Use the project's custom brand colors (`bg-aegis-brand`, `text-aegis-dark`, `text-aegis-accent`) defined in `tailwind.config.js`.
- Avoid writing custom CSS in `globals.css` unless absolutely necessary.
- Keep component state local unless it needs to be shared globally via `zustand`.

---

## Pull Request Evidence Checklist

Every pull request must include structured evidence demonstrating that the work is complete, tested, and traceable. A PR template is automatically loaded when you open a new pull request on GitHub.

### Required Evidence

Your PR must satisfy **all six** of the following categories:

1. **Issue Reference** — Every PR must link to a tracked issue using closing keywords (e.g., `Closes #125`). PRs without an issue reference will not be reviewed.

2. **Implementation Summary** — Describe what changed, why it changed, and list the key files affected. Reviewers should understand the scope of the PR from the summary alone.

3. **Testing** — Include tests that cover your changes, or provide a clear justification if tests are not applicable (e.g., documentation-only changes). Changes to compliance, KYC checks, RWA metadata, investor reads, admin actions, or transaction receipts must meet the [Aegis SDK Testing Standard](docs/sdk-testing-standard.md).

4. **Commands Run** — List the exact commands you ran locally to validate your change:
   ```bash
   npm install
   npm run lint
   npm run build
   npm run dev
   ```

5. **CI Status** — All CI checks must pass before requesting a review. If a check fails for an unrelated reason, document it in the reviewer notes.

6. **Acceptance Criteria Coverage** — Map each acceptance criterion from the linked issue to evidence that it has been satisfied. Use the table format provided in the PR template.

### Screenshots

If your PR includes UI changes, attach **before and after** screenshots or a screen recording in the designated section of the PR template.

> For the full evidence checklist specification, including detailed requirements, the review process, and FAQs, see [docs/pr-evidence-checklist.md](docs/pr-evidence-checklist.md).

---

## Review and Merge Process

1. **Self-review** — Before requesting a review, verify that the PR template is fully completed and all CI checks pass.
2. **Peer review** — At least one maintainer must approve the PR. Reviewers will use the evidence checklist as a structured evaluation guide.
3. **Address feedback** — Respond to all review comments. Push follow-up commits rather than force-pushing so reviewers can track incremental changes.
4. **Merge** — Once approved and all checks pass, a maintainer will merge the PR using a squash merge.

---

## Questions?

If you are unsure about any of these guidelines, open a discussion or ask in the relevant issue thread before submitting your PR.
