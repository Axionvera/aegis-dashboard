# Investor Transfer Request Flow

Closes #41. Documents the pre-submission validation layer for investor
transfers, and how it fits into the wider transfer flow that already exists
in `src/features/investor/components/TransferModal.tsx`.

## Scope of this document
This flow's idempotency guarantees, SDK error recovery, and eligibility
gating are covered elsewhere (see Related Documentation below) and are not
duplicated here. This document covers specifically the **request-validation
layer** that runs before a transfer reaches the review screen.

## Data Model
See `src/lib/transferRequest.ts` — a pure, framework-free module with no
React or SDK imports, so it can be unit-tested in isolation and reused by
any future entry point:
- `TransferRequestInput` — raw form input (recipient, amount as string).
- `TransferRequestContext` — sender address, available balance, and the
  asset's decimal precision (`asset.decimals`).
- `validateTransferRequest()` — pure validation function, no side effects.

## Flow
1. User opens `TransferModal` for an eligible asset (eligibility is
   evaluated separately — see `docs/investor-transfer-eligibility.md`).
2. On "Review Transfer", `handleReview` runs `validateTransferRequest`.
3. If valid, the recipient is checked against the whitelist/KYC service via
   `useAegis().checkWhitelist`, wrapped in a try/catch so an RPC failure is
   distinguished from a genuine "not whitelisted" result.
4. If compliant, the modal proceeds to the existing review → sign →
   progress → receipt flow (idempotency-guarded, with SDK error recovery).

## Edge Cases Handled
| Case | Behavior |
|---|---|
| Empty recipient/amount | Blocked before any network call |
| Malformed address (wrong prefix/length) | Blocked client-side (shape check only, see below) |
| Self-transfer | Blocked client-side |
| Zero/negative amount | Blocked client-side |
| Amount exceeds balance | Blocked client-side |
| Decimal precision beyond `asset.decimals` | Blocked client-side |
| Whitelist RPC failure vs. "not whitelisted" | Surfaced as distinct error messages; RPC failure no longer throws unhandled |
| Double-submit while pending | Already handled upstream by the idempotency guard (`docs/form-idempotency.md`) |

## Security & Compliance Assumptions
- **This is protocol-level compliance enforcement (a whitelist check), not
  legal or financial advice or a substitute for jurisdiction-specific
  KYC/AML review.** Wording throughout the UI should avoid implying
  otherwise — consistent with the existing SDK error recovery copy
  guardrails in `docs/sdk-error-recovery.md`.
- The client-side address check in `isPlausibleStellarAddress` is a
  **shape check only** (`G` prefix + 56 chars, base32 alphabet). It does
  NOT perform full StrKey/CRC16 checksum validation. It should not be
  relied on as the sole guard against a malformed address reaching the
  network — the underlying `@aegis/sdk` / Soroban RPC call is the actual
  source of truth and must reject invalid addresses independently.
- Whitelist status is authoritative on-chain/via RPC, not in the client.
  The client only decides whether to *attempt* the transfer.

## Testing
Pure validation logic is unit tested in `src/lib/transferRequest.test.ts`
(12 tests). `TransferModal.test.tsx`'s existing idempotency and SDK error
recovery coverage is unaffected — verified by running the full suite
(`npm run test`) after this change.

## Related Documentation
- [Investor Transfer Eligibility](investor-transfer-eligibility.md) — asset/wallet-level eligibility gating (Issue #55)
- [Form Idempotency](form-idempotency.md) — duplicate-submission protection
- [SDK Error Recovery](sdk-error-recovery.md) — post-submission failure classification and recovery
- [Transaction Components](transaction-components.md) — review/progress/receipt component contract