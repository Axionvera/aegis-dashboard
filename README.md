#  Aegis RWA Dashboard

The official web interface for the **Aegis RWA Protocol**. Built with Next.js, this dashboard provides an on-chain UI for administrators to mint tokenized references to Real-World Assets and for investors to view and transfer their on-chain balances.

> ⚠️ **Protocol-only software.** Aegis is a ledger protocol, not a broker, exchange, custodian, or financial institution, and does not provide legal, tax, or investment advice. Protocol-enforced rules (including address allowlists) are software-level mechanisms and do not constitute legal, regulatory, or KYC/AML compliance. See [docs/compliance-disclaimers.md](docs/compliance-disclaimers.md) for full disclaimers.

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
## Contribution Guidelines
We welcome frontend contributions! Check CONTRIBUTING.md for our branching strategies, tailwind styling rules, and the **Compliance & Disclaimer Review Checklist** that PRs touching asset/transfer/admin surfaces must satisfy. Look for // TODO: comments in the codebase for easy wins.