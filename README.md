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
## Contribution Guidelines
We welcome frontend contributions! Check CONTRIBUTING.md for our branching strategies and tailwind styling rules. Look for // TODO: comments in the codebase for easy wins.

## Security
Any PR that touches the wallet, signer, secret handling, diagnostics, transaction review, wrong-network handling, admin, compliance, or minting flows **must** complete the [Frontend Security Review Checklist](docs/security-checklist.md) before merging.