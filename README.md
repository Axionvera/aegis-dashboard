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

## Contributing

We welcome frontend contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

Key resources for contributors:

- [Contributing Guide](CONTRIBUTING.md) — Branch naming, component rules, PR evidence checklist, and review process
- [PR Evidence Checklist](docs/pr-evidence-checklist.md) — Detailed requirements for pull request evidence and documentation
- [Architecture Overview](docs/architecture.md) — Component hierarchy and state management
- [Frontend Developer Guide](docs/frontend-guide.md) — Styling conventions and page creation
- [Compliance Reviewer Workflow](docs/compliance-reviewer-workflow.md) — Guide for compliance operators reviewing investor eligibility

> **Note:** All pull requests must follow the [PR Evidence Checklist](docs/pr-evidence-checklist.md). The checklist template is automatically loaded when you open a new PR.

The transactions page also includes a contributor-ready fixture gallery for transaction review, progress, and receipt states. See [docs/transaction-components.md](docs/transaction-components.md) for the shared component contract, fixture expectations, and compliance-safe wording guidance.

## Route Access
Role-aware route guards protect admin, issuer, investor, and read-only sections. See `docs/route-access.md` for route mapping, guard states, SDK assumptions, and mock wallet fixtures.
