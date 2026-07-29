# Admin RWA Asset Minting Workflow

Closes #6. Documents the guided admin minting flow for compliant RWA asset
issuance: asset selection, recipient & amount validation, compliance
pre-check, review, Freighter signing phases, and receipt / recovery states.

## Scope

This document covers the **minting workflow** itself. Related concerns are
documented elsewhere and not duplicated here:

| Concern | Document |
|---|---|
| Shared review / progress / receipt UI | [transaction-components.md](transaction-components.md) |
| Double-submit / idempotency | [form-idempotency.md](form-idempotency.md) |
| Failure / unknown recovery | [sdk-error-recovery.md](sdk-error-recovery.md) |
| Feature flag gating | [feature-flags.md](feature-flags.md) |
| Mock amount → outcome mapping | [mock-mode.md](mock-mode.md) |
| Post-mint lifecycle states | [asset-lifecycle-status.md](asset-lifecycle-status.md) |

## Entry point

- Route: `/admin` (admin role only — see [route-access.md](route-access.md))
- Component: `src/features/minting/components/MintWorkflow.tsx`
- Wired from `src/features/admin/components/AdminPanel.tsx` when the
  `newMintFlow` feature flag is enabled (default: **on**)
- Legacy fixed-amount panel remains available when `newMintFlow` is toggled off

## Flow

```
idle (asset + recipient + amount)
  → validateMintRequest
  → checkWhitelist (compliance pre-check)
  → review (TransactionReview)
  → signing / pending (TransactionProgress, Freighter via provider phases)
  → success receipt | failure/unknown recovery (SdkErrorRecovery)
```

1. Admin selects a mintable asset from the catalogue
   (`src/features/minting/fixtures.ts`).
2. Admin enters recipient address and amount.
3. On **Review mint**, `validateMintRequest` runs
   (`src/lib/mintRequest.ts`).
4. If valid, `useAegis().checkWhitelist(recipient)` runs. RPC failure and
   "not whitelisted" are surfaced as distinct errors — neither advances to
   review.
5. Review screen shows asset, amount, recipient, signer, and network.
6. **Confirm & Sign** submits through `useIdempotentSubmit({ scope: 'mint' })`
   and `useAegis().mint(...)`. Provider phase callbacks drive the progress UI
   (`signing` → `pending`); Freighter signing is owned by the provider /
   wallet layer, not called directly from the dashboard.
7. Success / pending → `TransactionReceipt`. Failure / unknown →
   `SdkErrorRecovery` with a classified plan.

## Data model

### Validation — `src/lib/mintRequest.ts`

Pure module (no React / SDK imports):

- `MintRequestInput` — recipient, amount (string), assetId
- `MintRequestContext` — `maxDecimals`, optional soft `maxAmount`
- `validateMintRequest()` — returns `{ valid, error?, parsedAmount? }`

Reuses `isPlausibleStellarAddress` from `transferRequest.ts` (shape check
only — not full StrKey/CRC16 validation).

### Mintable assets — `src/features/minting/fixtures.ts`

Synthetic catalogue for the selector (`MintableAsset`: id, name, ticker,
decimals, assetClass, description). Replace with an SDK registry read when
the live asset-registry API is available.

## Edge cases

| Case | Behaviour |
|---|---|
| Empty asset / recipient / amount | Blocked before any network call |
| Malformed Stellar address | Blocked client-side (shape check) |
| Zero / negative amount | Blocked client-side |
| Decimal precision beyond asset decimals | Blocked client-side |
| Amount above soft cap | Blocked client-side (`DEFAULT_MINT_MAX_AMOUNT`) |
| Whitelist RPC failure vs not whitelisted | Distinct error messages |
| Double-submit on Confirm | Idempotency guard — single provider call |
| Provider FAILED / unknown / thrown error | Recovery panel; unknown does not offer blind retry |

## Mock mode outcomes

Because amount is user-entered (unlike the legacy fixed `1000`), admins can
exercise non-success paths in mock mode:

| Amount | Mock outcome |
|---|---|
| `0.01` | FAILED |
| `0.02` | PENDING |
| `0.03` | unknown status |
| anything else | SUCCESS |

## Security & compliance assumptions

- The whitelist check is **protocol-level compliance enforcement**, not legal
  or financial advice. UI copy must stay consistent with
  [compliance-safe-wording.md](compliance-safe-wording.md) and
  [sdk-error-recovery.md](sdk-error-recovery.md).
- On-chain / RPC whitelist status is authoritative; the client only decides
  whether to *attempt* the mint.
- Soft amount caps and address shape checks are UX guards only — the SDK /
  contracts remain the source of truth.

## Testing

| Layer | Location |
|---|---|
| Pure validation | `src/lib/mintRequest.test.ts` |
| Workflow (happy, validation, compliance, idempotency, recovery) | `src/features/minting/components/MintWorkflow.test.tsx` |
| Flag wiring | `src/features/admin/components/AdminPanel.test.tsx` |
| Provider mint outcomes | `src/__tests__/sdk/provider.test.ts` |

## Related

- Issue #6 — Implement RWA asset minting workflow
- Transfer counterpart: [investor-transfer-request-flow.md](investor-transfer-request-flow.md)
- `TransferModal` is the UX template this flow mirrors
