# Compliance and Legal Disclaimers

This document explains the boundary between what the Aegis protocol can guarantee at the smart-contract level and what can only be guaranteed by applicable law. All contributors and integrators must read and follow this guidance before touching compliance-sensitive UI, copy, or smart-contract logic.

## 1. Core Principle: Protocol ≠ Legal

Aegis is a **ledger protocol** that runs unmodified smart-contract code on a public network (Stellar/Soroban). It is **not**:

- A broker, dealer, exchange, alternative trading system, or marketplace.
- A custodian, fiduciary, escrow agent, or money services business.
- A credit, KYC/AML, securities-registration, or transfer-agent service.
- A provider of legal, tax, accounting, investment, or financial advice.

When the protocol enforces an allowlist, halts a transfer, or mints a token, it is executing code. It has no awareness of, and no authority over, the legal regimes of any jurisdiction. **Code-level enforcement is not a legal guarantee.**

## 2. Approved vs. Discouraged Terminology

The following table lists terms that are commonly used in compliant products but are inappropriate for this protocol's open-source dashboard. When in doubt, choose the protocol-aware phrasing.

| Discouraged (implies legal/regulatory claim) | Preferred (describes protocol behavior) |
| --- | --- |
| KYC / KYC-verified / KYC whitelisted | Protocol allowlist / on-chain allowlist |
| AML-checked | Protocol-level screening |
| Legal owner / legal ownership | Token holder / on-chain holder |
| Compliant / regulatory compliance | Configurable on-chain rules |
| Securities-qualified offering | Token issuance event |
| Guaranteed / backed by | Reflects / represents |
| Institutional-grade | Configurable / modular |

Subtle copy that can mislead even when superficially accurate must also be avoided. For example, instead of "trustless B2B trading", say "peer-to-peer recorded transfers", and instead of "securely on Stellar", say "recorded on Stellar."

## 3. Mandatory Disclaimer Surfaces

Every compliance-sensitive screen must surface a disclaimer using `src/components/Disclaimer.tsx`. The required mappings are:

| Surface | Variant | Required copy topic |
| --- | --- | --- |
| App-wide (`_app.tsx`) | `footer` | Aegis as protocol only; no advice; allowlist ≠ KYC |
| Landing (`index.tsx`) | `page` | Protocol does not guarantee regulatory compliance |
| Investor portfolio (`portfolio.tsx`) | `page` | On-chain balances ≠ off-chain asset reality/legal rights |
| Admin / Minting (`admin.tsx`, `AdminPanel`) | `page` + `modal` | Admin actions update protocol state only |
| Asset card (`AssetCard`) | `card` | Token is a protocol-level representation |
| Transfer modal (`TransferModal`) | `modal` | On-chain rules ≠ legal compliance; txs are irreversible |
| Whitelist / allowlist helper text | `modal` | Adding to allowlist is not a legal determination |

## 4. Developer Workflow

When adding a new page, modal, panel, or card that touches any of: assets, balances, admin actions, transfers, allowlists, minting, or compliance messaging:

1. Import `Disclaimer` from `@/components/Disclaimer` and place it within the same screen.
2. Pick the variant that matches the surface (see §3).
3. Use the **approved** terminology in §2 throughout your new UI.
4. Treat any existing `// TODO` comments in `PortfolioList.tsx`, `useWallet.ts`, and `AssetCard.tsx` as work that must also align with §2 once implemented (e.g., fetched balances need the same disclaimer treatment).

## 5. Review Checklist (mirrored in CONTRIBUTING.md)

Before opening a PR that touches any UI shown above, confirm:

- [ ] No discouraged terminology from §2 is introduced or re-introduced.
- [ ] The appropriate `Disclaimer` variant for the surface is in place, with protocol-aware copy.
- [ ] No new copy implies jurisdictional compliance, legal ownership, or guaranteed custody.
- [ ] No new copy promises investment returns, appreciation, or any financial outcome.
- [ ] Error states (failed KYC mocks, transfer failures) are framed as **protocol rejections**, not "non-compliance" findings.
- [ ] Lint and typecheck pass (`npm run lint`, `npx tsc --noEmit`).

## 6. Open Questions / Out of Scope

This document does **not** constitute legal advice. It is a developer-facing guide for keeping the protocol's open-source dashboard within the boundaries of what the code actually does. Engagement with qualified counsel is required before any production deployment, token offering, or business activity that maps a token to a real-world asset in any jurisdiction.
