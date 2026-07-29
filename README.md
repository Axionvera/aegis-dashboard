# Aegis RWA Dashboard

The official web interface for the **Aegis RWA Protocol**. Built with Next.js, this dashboard provides a seamless UI for administrators to mint compliant Real-World Assets and for investors to manage their portfolios.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [Freighter Wallet](https://www.freighter.app/) Browser Extension

## Local Setup

1. Clone the repository and install dependencies:
```bash
   npm install
```
2. Run the development server:
```bash
   npm run dev
```
3. Open http://localhost:3000 in your browser.
## Contribution Guidelines
We welcome frontend contributions! Check [CONTRIBUTING.md](CONTRIBUTING.md) for our branching strategies and Tailwind styling rules. Look for `// TODO:` comments in the codebase for easy wins.

## Contributing

We welcome frontend contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

Key resources for contributors:

- [Evaluation Readiness Dashboard](docs/evaluation-readiness.md) — Central summary page for testing standards, CI workflow, PR evidence, acceptance criteria mapping, self-review, and payment guidance
- [Contributing Guide](CONTRIBUTING.md) — Branch naming, component rules, PR evidence checklist, and review process
- [Evaluation-Readiness Index](docs/evaluation-readiness-index.md) — Central page linking every requirement for GrantFox evaluation: payment expectations, testing standards, CI guidance, acceptance criteria audit, self-assessment, and reviewer checklist
- [PR Evidence Checklist](docs/pr-evidence-checklist.md) — Detailed requirements for pull request evidence and documentation
- [Test-First Contribution Guide](docs/test-first-contribution-guide.md) — How to write tests before code, with area-specific patterns and examples
- [Aegis Dashboard Minimum Testing Standard](docs/testing-standard.md) — Minimum test coverage for admin workflows, investor views, compliance screens, asset registration, minting, wallet connection, and diagnostics
- [Aegis SDK Testing Standard](docs/sdk-testing-standard.md) — Minimum unit, integration, and negative-path test coverage for compliance, KYC, RWA metadata, investor reads, admin actions, and transaction receipts
- [Architecture Overview](docs/architecture.md) — Component hierarchy and state management
- [Frontend Developer Guide](docs/frontend-guide.md) — Styling conventions and page creation
- [Compliance Reviewer Workflow](docs/compliance-reviewer-workflow.md) — Guide for compliance operators reviewing investor eligibility
- [Investor Transfer Request Flow](docs/investor-transfer-request-flow.md) — Request-validation edge cases (address, self-transfer, amount, precision) and RPC-failure handling for the transfer modal
- [Compliance-Safe Wording Guidance](docs/compliance-safe-wording.md) — Canonical disclaimer text, typed helper, and reviewer checklist for compliance-facing copy
- [Environment Mismatch Blocking Screen](docs/environment-mismatch-blocking.md) — Full-page blocking screen when the wallet network does not match the dashboard target network

> **Note:** All pull requests must follow the [PR Evidence Checklist](docs/pr-evidence-checklist.md) and be audited against the [Evaluation Readiness Dashboard](docs/evaluation-readiness.md) before requesting review.

The transactions page also includes a contributor-ready fixture gallery for transaction review, progress, and receipt states. See [docs/transaction-components.md](docs/transaction-components.md) for the shared component contract, fixture expectations, and compliance-safe wording guidance.

## Evaluation Readiness
Before submitting a pull request for maintainer review or payment evaluation, review the [Evaluation Readiness Dashboard](docs/evaluation-readiness.md). It links testing standards, CI status expectations, PR evidence templates, acceptance criteria mapping, and conduct guidelines into a single scorecard.

## Payment-Period Conduct
During GrantFox evaluation windows, all contributors must follow the [Payment-Period Conduct Policy](docs/payment-period-conduct.md). Repeated spam, payout-related complaints, or harassment in community channels will not be tolerated. Self-review your PR thoroughly before raising payment concerns.

## Route Access
Role-aware route guards protect admin, issuer, investor, and read-only sections. See `docs/route-access.md` for route mapping, guard states, SDK assumptions, and mock wallet fixtures.

## Contribution Quality Examples
Before submitting a PR, read the [Contribution Quality Examples](docs/contribution-quality-examples.md) for concrete examples of low-effort, partial, under-tested, failing-CI, and acceptable contributions — including what each category looks like and how to improve it. The companion [Low-Effort PR Examples](docs/low-effort-pr-examples.md) covers additional screenshot and CI-specific anti-patterns.

## Documentation Index
A full index of every file in `docs/` organised by audience (onboarding, building features, review and payment, release) is at [docs/README.md](docs/README.md).