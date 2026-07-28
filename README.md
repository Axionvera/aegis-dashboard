#  Aegis RWA Dashboard

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
```
   npm run dev
```
3. Open http://localhost:3000 in your browser.

> [!TIP]
> **Having issues?** Check our [Troubleshooting Guide](docs/troubleshooting.md) for solutions to common Node, Freighter, and Next.js setup problems.

## Contribution Guidelines
We welcome frontend contributions! Check CONTRIBUTING.md for our branching strategies and tailwind styling rules. Look for // TODO: comments in the codebase for easy wins.

## Testing & Evidence Expectations
All PRs that modify application behavior must include testing evidence — see [docs/testing-evidence-requirement.md](docs/testing-evidence-requirement.md) for the full policy and [.github/pull_request_template.md](.github/pull_request_template.md) for the checklist rendered in every new pull request.

## Release Readiness Review
Please review the [Release Readiness Review](docs/release-readiness-review.md) before considering any release to production or testnet. It outlines current security flaws, limitations, and UX gaps.

## Payment-Period Conduct
Contributors paid through the GrantFox evaluation process should read the [Payment-Period Conduct Note](docs/payment-period-conduct.md). It covers self-review before merge, screenshot and test-output expectations, and the rules around repeated submissions and complaints during evaluation windows.

## Transaction History
The dashboard now includes a normalized transaction history view at `/transactions`. See `docs/transaction-history.md` for model details, supported operation types, fixture coverage, and current data source limitations.

## Route Access
Role-aware route guards protect admin, issuer, investor, and read-only sections. See `docs/route-access.md` for route mapping, guard states, SDK assumptions, and mock wallet fixtures.
