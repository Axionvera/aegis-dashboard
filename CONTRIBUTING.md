# Contributing to Aegis Dashboard

We love open-source contributions! To ensure a smooth and productive process, please follow the guidelines below.

1. **Branch Naming:** Use `feat/`, `fix/`, `ui/`, or `docs/`.
2. **Component Rules:** If building a new UI component, ensure it is fully responsive (mobile-first via Tailwind).
3. **Pull Requests:** Include a screenshot or GIF of your UI changes in the PR description.
4. **Evaluation Readiness:** Before opening or submitting your PR, review the **[Evaluation Readiness Dashboard](docs/evaluation-readiness.md)** to verify your branch passes all testing, CI, evidence, and conduct requirements.

---

## Evaluation Readiness Checklist

Before marking your pull request as ready for review or evaluation, ensure:

- **Testing Standard:** Unit, integration, and negative-path coverage added per [Dashboard Testing Standard](docs/testing-standard.md) and [SDK Testing Standard](docs/sdk-testing-standard.md).
- **CI Pipeline:** All GitHub Actions checks in [.github/workflows/ci.yml](.github/workflows/ci.yml) pass cleanly.
- **PR Evidence:** Complete all 6 checklist items in [.github/pull_request_template.md](.github/pull_request_template.md).
- **Acceptance Criteria Mapping:** Explicitly map issue acceptance criteria to delivered evidence.
- **Payment Conduct:** Review guidelines in [Payment-Period Conduct Note](docs/payment-period-conduct.md) and [Contributor Payment Guide](docs/contributor-payment-guide.md).

---

## For Maintainers and Reviewers

Before approving or merging a pull request, please follow the **[Reviewer Quality Checklist](docs/reviewer-checklist.md)**. This checklist covers:

- PR hygiene and scope verification
- Implementation completeness against acceptance criteria
- Code quality and architectural consistency
- Styling and responsiveness standards
- Test coverage and manual verification
- CI pipeline status
- Security and sensitive data checks
- Documentation completeness

A condensed version of the checklist is also embedded in the [pull request template](.github/pull_request_template.md) for convenient use during reviews.

