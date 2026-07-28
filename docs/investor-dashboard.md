# Investor Portfolio Dashboard

The `/portfolio` page gives a connected investor a read-only view of the RWA
holdings the Aegis protocol has recorded for their address: what they hold,
metadata about each asset, its compliance status, and whether it is
currently eligible to transfer.

## Data flow

```
src/pages/portfolio.tsx
  -> src/features/investor/components/PortfolioList.tsx
       -> src/features/investor/hooks/usePortfolio.ts
            -> src/hooks/useAegis.ts (getPortfolio)
                 -> src/lib/aegis/client.ts (getPortfolio)
```

`src/lib/aegis/client.ts` is a stand-in for the real `@aegis/sdk` package,
which is not yet published to this repository. It mimics the shape and
latency of the SDK's portfolio read model (`src/lib/aegis/types.ts`) so the
rest of the app can be built and tested against a stable contract. When the
real SDK is available, only the function bodies in `client.ts` need to
change — `useAegis`, `usePortfolio`, and every UI component are written
against the `PortfolioReadModel` / `PortfolioAsset` types, not against the
mock implementation.

## What a `PortfolioAsset` represents

Each holding carries:

- **Balance** — the raw token balance recorded on-chain for this address.
- **Metadata** (`assetClass`, `issuer`, `jurisdiction`, `description`) —
  descriptive information about the asset, sourced from the protocol's
  off-chain asset registry.
- **Compliance status** — `compliant`, `restricted`, or `pending_review`,
  reflecting whether the investor's KYC/accreditation record satisfies this
  asset's requirements *as last checked by the protocol*.
- **Transfer eligibility** — `eligible`, `ineligible`, or `unknown`, with
  human-readable reasons when a transfer is blocked. Eligibility is derived
  from compliance status plus any asset-specific transfer restrictions
  (lockups, jurisdiction gating, etc.). It is intentionally a separate field
  from compliance status: an investor can be compliant in general but still
  ineligible to transfer a specific restricted asset class.
- **`isDataAvailable`** — set to `false` when the SDK could resolve an
  on-chain balance but not the corresponding off-chain metadata/compliance
  record. The UI never fabricates values in this case; it shows the balance
  with an explicit "unavailable" notice and disables transfer until the
  registry responds.

## UI states

`PortfolioList` renders one of four states based on `usePortfolio`'s status:

| Status    | Rendered UI                                                   |
|-----------|----------------------------------------------------------------|
| `loading` | Skeleton asset cards (`AssetCardSkeleton`)                     |
| `error`   | `PortfolioErrorState` with the failure reason and a retry action |
| `ready`, zero assets | `PortfolioEmptyState`                              |
| `ready`, one or more assets | A grid of `AssetCard`s plus the disclaimer footer |

Additionally, `portfolio.tsx` itself handles the "wallet not connected"
case before `PortfolioList` ever mounts, since there is no address to query
yet.

Per-asset, `AssetCard` has its own degraded state for `isDataAvailable:
false`, and disables the Transfer button whenever `transferEligibility.state
!== 'eligible'`. `TransferModal` re-checks eligibility independently rather
than trusting the caller, so any future entry point into the transfer flow
can't bypass the restriction.

## Assumptions and limitations

- This dashboard displays **protocol-recorded state only**. It does not
  imply financial advice, a recommendation to hold or transfer any asset,
  or legal proof of ownership beyond what the Aegis protocol has recorded.
  See the disclaimer rendered at the bottom of a populated portfolio
  (`PortfolioDisclaimer`).
- Compliance and eligibility reflect the **last successful sync** with the
  compliance registry, not necessarily the current instant. A "Compliant"
  badge is not a live guarantee at the moment of viewing.
- The dashboard shows holdings for a **single connected wallet address**
  at a time; it does not aggregate across multiple wallets.
- Historical pricing/valuation charts are out of scope for this iteration.
- The mock client always resolves for a well-formed, non-empty address. A
  real integration should surface genuine network/RPC failures through the
  same `error` status so `PortfolioErrorState` continues to work unchanged.
