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

## Testing

Run the test suite:
```bash
npm test
```

Tests use reusable fixtures from `src/fixtures/` — see the [Test Fixture Guide](docs/test-fixtures.md) for available mock data (wallet states, compliance, assets, portfolios, transactions, errors).

## Contribution Guidelines
We welcome frontend contributions! Check CONTRIBUTING.md for our branching strategies and tailwind styling rules. Look for // TODO: comments in the codebase for easy wins.