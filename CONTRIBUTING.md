# Contributing to Aegis Dashboard

We love open-source contributions! To ensure a smooth process:

1. **Branch Naming:** Use `feat/`, `fix/`, `ui/`, or `docs/`.
2. **Component Rules:** If building a new UI component, ensure it is fully responsive (mobile-first via Tailwind).
3. **Pull Requests:** Include a screenshot or GIF of your UI changes in the PR description.

## Compliance & Disclaimer Review Checklist

PRs that touch **any** of the following surfaces must satisfy this checklist before merge: asset lists, balances, transfers, minting/allowlist admin panels, compliance/policy messaging, or any page visitors may read as implying legal/financial determinations.

- [ ] No discouraged terminology is introduced (e.g., "KYC", "compliant", "guaranteed", "legal owner", "trustless B2B trading", "institutional-grade", "securely on"). See `docs/compliance-disclaimers.md` §2 for the full mapping.
- [ ] Approved, protocol-aware phrasing is used throughout ("protocol allowlist", "on-chain state", "tokenized representation", "recorded on", etc.).
- [ ] An appropriate `<Disclaimer variant=… />` is rendered on each compliance-sensitive page/modal/card. Required variants are listed in `docs/compliance-disclaimers.md` §3.
- [ ] No copy implies jurisdictional compliance, KYC/AML verification, securities-law conformance, or guaranteed custody.
- [ ] No copy promises investment returns, appreciation, yields, or any financial outcome.
- [ ] Error states are framed as **protocol rejections** (not "non-compliance findings").
- [ ] `npm run lint` and `npx tsc --noEmit` pass locally.
- [ ] PR description links the issue (e.g., `Closes #23`) and notes any disclaimer copy that was added or reworded.
