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

## Mock Mode (No Live Contracts Required)

Frontend contributors can run the full dashboard UI without a live Soroban RPC endpoint or deployed contracts. Set `NEXT_PUBLIC_MOCK_MODE="true"` in `.env.local` to activate the built-in mock SDK provider.

```bash
cp .env.example .env.local
# then set NEXT_PUBLIC_MOCK_MODE="true" in .env.local
npm run dev
```

An amber warning banner is shown on every page when mock mode is active. See [docs/mock-mode.md](docs/mock-mode.md) for full setup instructions, fixture data reference, and safety warnings.

## Contribution Guidelines
We welcome frontend contributions! Check CONTRIBUTING.md for our branching strategies and tailwind styling rules. Look for // TODO: comments in the codebase for easy wins.

## Testing & Evidence Expectations
All PRs that modify application behavior must include testing evidence — see [docs/testing-evidence-requirement.md](docs/testing-evidence-requirement.md) for the full policy and [.github/pull_request_template.md](.github/pull_request_template.md) for the checklist rendered in every new pull request.

## Release Readiness Review
Please review the [Release Readiness Review](docs/release-readiness-review.md) before considering any release to production or testnet. It outlines current security flaws, limitations, and UX gaps.

## Payment-Period Conduct
Contributors paid through the GrantFox evaluation process should read the [Payment-Period Conduct Note](docs/payment-period-conduct.md). It covers self-review before merge, screenshot and test-output expectations, and the rules around repeated submissions and complaints during evaluation windows.

## Reviewer Checklist
When reviewing a GrantFox-submitted PR, use the [Reviewer Checklist](docs/reviewer-checklist.md) to verify implementation correctness, accessibility, test coverage, and acceptance criteria before approval.

## Local Verification
Before opening a pull request, run the complete verification command:



This runs build, lint, and typecheck () locally to catch issues before CI. See the [Testing & Evidence PR Requirement](docs/testing-evidence-requirement.md) for what to include in your PR.

## Contributor Payment Guide
Before working on a GrantFox-tagged issue, review the [Contributor Payment Guide](docs/contributor-payment-guide.md). It covers evaluation criteria, required artifacts (screenshots and tests), and professional conduct expectations.

## Low-Effort PR Examples
Before submitting a PR, review [Low-Effort PR Examples](docs/low-effort-pr-examples.md) for guidance on what GrantFox evaluators look for — including screenshot requirements, test coverage expectations, and CI standards.

## Transaction History
The dashboard now includes a normalized transaction history view at `/transactions`. See `docs/transaction-history.md` for model details, supported operation types, fixture coverage, and current data source limitations.

## Route Access
Role-aware route guards protect admin, issuer, investor, and read-only sections. See `docs/route-access.md` for route mapping, guard states, SDK assumptions, and mock wallet fixtures.
