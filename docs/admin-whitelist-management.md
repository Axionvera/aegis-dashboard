# Admin Compliance Management — KYC Whitelist

Issue: [#4](https://github.com/Axionvera/aegis-dashboard/issues/4)

> **Important:** This document describes protocol-level whitelist mechanics in the Aegis Dashboard. It is **not legal, regulatory, or financial advice**. Whitelist entries reflect on-chain and dashboard-admin actions only.

## Purpose

Gives `admin`-role wallets a single place to view, search, add, remove, and audit the addresses currently permitted to hold or receive the protocol's assets under its KYC rules.

Lives on the existing `/admin` route (already restricted to the `admin` role by `RouteGuard`), alongside the mint/whitelist quick-action panel and feature flags panel. See [route-access.md](route-access.md).

## Data Model

Types live in `src/lib/whitelist.ts`:

| Export | Purpose |
|---|---|
| `WhitelistEntry` | `{ address, status, updatedBy, updatedAt, note? }` — a single tracked address |
| `WhitelistEntryStatus` | `'whitelisted' \| 'revoked'` |
| `validateWhitelistAddress(address)` | Client-side Stellar address shape check before submission |
| `searchWhitelistEntries(entries, query)` | Case-insensitive search across address and note |
| `guardWhitelistAction(entries, address, action)` | Blocks no-op actions (adding an already-whitelisted address, removing one that isn't) |

All functions are pure and framework-agnostic — see `src/lib/whitelist.test.ts` for coverage.

## SDK Surface

`IAegisProvider` (`src/lib/sdk/IAegisProvider.ts`) exposes three admin methods, implemented by both `MockAegisProvider` and `LiveAegisProvider`:

- `listWhitelist(): Promise<WhitelistEntry[]>`
- `addToWhitelist(address, actor, onPhase?): Promise<RawTransactionOutcome>`
- `removeFromWhitelist(address, actor, onPhase?): Promise<RawTransactionOutcome>`

`LiveAegisProvider` delegates to stub functions in `src/lib/aegis/client.ts`, marked `TODO(@aegis/sdk)` — swap their bodies for real signed contract calls once `@aegis/sdk` is published. Nothing outside `client.ts` needs to change.

`useAegis()` wraps all three with loading state and records every add/remove as a `compliance_update` entry in the transaction history store (`src/features/transactions/store.ts`), so admin whitelist changes show up in transaction history alongside mints and transfers.

## UI

`WhitelistManager` (`src/features/compliance/components/WhitelistManager.tsx`):

- **Search** — reuses `TableSearch` from `@/components/table`.
- **Add form** — validates the address client-side (`validateWhitelistAddress`) and blocks no-ops (`guardWhitelistAction`) before opening the review modal.
- **Table** — address (truncated, full value in `title`), status badge, last-updated timestamp, note, and a Remove / Re-add action per row.
- **States** — `loading` (inline spinner text), `error` (`EmptyState` variant `unavailable` with a Retry action), and `no-data` (`EmptyState` variant `no-data`, worded differently for "no entries at all" vs "no search matches").

`WhitelistActionModal` (`src/features/compliance/components/WhitelistActionModal.tsx`) is the review-before-signing flow, shared by both add and remove:

1. **Review** — `TransactionReview` shows the address, action, and note; nothing is submitted yet.
2. **Signing / Pending** — `TransactionProgress` reflects the two phases reported by the provider's `onPhase` callback while Freighter is prompted and the transaction is submitted.
3. **Receipt** — `TransactionReceipt`, normalised by the shared `mapToTransactionResult`, so success/failure/pending/unknown all render consistently with every other signed action in the dashboard (mint, transfer, bulk compliance updates).

This mirrors the existing `ComplianceUpdateModal` pattern used by bulk compliance review — no new modal chrome, wallet-signing logic, or receipt styling was introduced.

## Freighter Signing

Signing is handled entirely by the existing `useAegis` → `getAegisProvider()` → Freighter flow already used by mint and transfer. `WhitelistActionModal` never talks to Freighter directly; it only reports phase changes it receives from `onSubmit`, keeping wallet-interaction code in one place.

## Compliance Disclaimer

The review screen shows `COMPLIANCE_DISCLAIMER` from `src/lib/complianceReview.ts` beneath the confirm/cancel buttons, matching every other compliance-facing surface in the dashboard.

## Testing

- `src/lib/whitelist.test.ts` — validation, search, and no-op guard logic.
- `src/__tests__/sdk/provider.test.ts` — `MockAegisProvider.listWhitelist` / `addToWhitelist` / `removeFromWhitelist`, including that `listWhitelist` returns defensive copies and that phase callbacks fire.

## Known Limitations

- `MockAegisProvider`'s whitelist state is in-memory only and resets on page reload — this is a mock, not persistence, consistent with the rest of the mock SDK.
- `LiveAegisProvider`'s whitelist methods are stubs pending the real `@aegis/sdk` package (see `docs/investor-dashboard.md` and `docs/mock-mode.md` for the same pattern applied elsewhere).
- Bulk whitelist changes are out of scope here — see [kyc-bulk-import-design.md](kyc-bulk-import-design.md) for the batch/CSV workflow.

## Related

- [Route Access](route-access.md) — why this lives behind the `admin`-only `/admin` route
- [Bulk Compliance Review](bulk-compliance-review.md) — the batch/CSV counterpart to this single-address flow
- [Transaction Components](transaction-components.md) — shared review/progress/receipt building blocks
- [Compliance-Safe Wording Guidance](compliance-safe-wording.md) — canonical disclaimer text
- [Audit Log](audit-log.md) — the broader audit-log module this feature's actions feed into via transaction history