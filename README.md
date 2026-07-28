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
## Documentation
- [Architecture](docs/architecture.md)
- [Frontend Developer Guide](docs/frontend-guide.md)
- [Accessibility Review Checklist](docs/accessibility-checklist.md) — required reading before any UI PR

## Accessibility
This dashboard moves real-world assets, so keyboard access, labels, focus handling and screen
reader support are treated as functional requirements rather than polish. Every frontend
contribution is reviewed against the
[Accessibility Review Checklist](docs/accessibility-checklist.md), which covers forms, tables,
modals, navigation, and wallet/signing flows with examples taken from this codebase.

## Contribution Guidelines
We welcome frontend contributions! Check CONTRIBUTING.md for our branching strategies and tailwind styling rules. Look for // TODO: comments in the codebase for easy wins.