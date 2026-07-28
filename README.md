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
```bash
   npm run dev
```
3. Open http://localhost:3000 in your browser.
## Contribution Guidelines
We welcome frontend contributions! Check CONTRIBUTING.md for our branching strategies and tailwind styling rules. Look for // TODO: comments in the codebase for easy wins.

## Documentation
- [Admin Role Management — UI Design & Implementation Plan](./docs/admin-role-management-design.md) — design-first role model, permission matrix, risks, and approval flow (security-sensitive; implementation pending review).
- [Investor Transfer Eligibility Panel](./docs/investor-transfer-eligibility.md) — explains send/receive eligibility (compliant, blocked, unknown, unavailable) with copy guardrails.
- [Frontend Developer Guide](./docs/frontend-guide.md)
- [Architecture](./docs/architecture.md)
