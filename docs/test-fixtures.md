# Test Fixture Framework

This document explains the dashboard's test fixture framework — reusable mock data for consistent testing and development.

## Overview

Fixtures provide standardised fake data that simulates real SDK responses, wallet states, and contract interactions. They prevent mock drift and ensure all contributors test against the same expectations.

## Directory Structure

```
src/fixtures/
├── index.ts              # Barrel export (import from '@/fixtures')
├── wallet.ts             # Wallet connection states
├── compliance.ts         # KYC whitelist states
├── assets.ts             # Asset metadata and balances
├── portfolio.ts          # Investor portfolio states
├── transactions.ts       # Transaction receipts
├── errors.ts             # SDK and contract error codes
└── __tests__/
    ├── wallet.test.ts
    ├── compliance.test.ts
    ├── assets.test.ts
    ├── portfolio.test.ts
    ├── transactions.test.ts
    └── errors.test.ts
```

## Fixture Categories

### Wallet (`wallet.ts`)

Simulates Freighter wallet connection states:

| Fixture | Description |
|---|---|
| `walletConnectedTestnet` | Connected on testnet |
| `walletConnectedMainnet` | Connected on mainnet |
| `walletDisconnected` | Not connected (null address/network) |
| `walletConnecting` | Connection in progress |
| `walletUnknownNetwork` | Connected on unexpected network |
| `walletLongAddress` | Edge case: very long address |
| `walletSpecialCharsAddress` | Edge case: special characters in address |

### Compliance (`compliance.ts`)

Simulates KYC whitelist states:

| Fixture | Description |
|---|---|
| `complianceWhitelisted` | User is KYC approved |
| `complianceNotWhitelisted` | User is not approved |
| `complianceRevoked` | User's KYC was revoked |
| `compliancePending` | User awaiting review |
| `mockCheckWhitelist` | Mock async whitelist checker |

### Assets (`assets.ts`)

Simulates asset metadata:

| Fixture | Description |
|---|---|
| `assetCommercialRealEstate` | CRE token, 50.5 balance |
| `assetTreasuryBill` | T-Bill token, 10,000 balance |
| `assetZeroBalance` | Token with 0 balance |
| `assetLargeBalance` | Token with ~1B balance |
| `assetFractional` | Token with 0.001 balance |
| `defaultPortfolioAssets` | Array of 2 assets |

### Portfolio (`portfolio.ts`)

Simulates investor portfolios:

| Fixture | Description |
|---|---|
| `portfolioStandard` | 2 assets, ~$1M total |
| `portfolioEmpty` | No assets (new investor) |
| `portfolioSingleAsset` | 1 asset |
| `portfolioManyAssets` | 12 assets (grid stress test) |

### Transactions (`transactions.ts`)

Simulates transaction receipts:

| Fixture | Description |
|---|---|
| `txTransferSuccess` | Successful transfer |
| `txMintSuccess` | Successful admin mint |
| `txPending` | Transaction in progress |
| `txFailed` | Failed: insufficient balance |
| `txFailedNotWhitelisted` | Failed: recipient not whitelisted |

### Errors (`errors.ts`)

Simulates SDK and contract errors:

| Fixture | Category | Description |
|---|---|---|
| `errorWalletNotConnected` | wallet | Freighter not installed |
| `errorWalletRejected` | wallet | User rejected connection |
| `errorNetworkMismatch` | network | Wrong network |
| `errorRpcUnavailable` | network | Soroban RPC down |
| `errorInsufficientBalance` | contract | Not enough tokens |
| `errorNotWhitelisted` | contract | Recipient not KYC'd |
| `errorUnauthorized` | contract | Wrong role |
| `errorContractPaused` | contract | Contract is paused |
| `errorInvalidAddress` | validation | Bad address format |
| `errorAmountNotPositive` | validation | Zero/negative amount |
| `errorUnknown` | contract | Unexpected error |

## Usage

### In tests

```typescript
import { walletConnectedTestnet, assetCommercialRealEstate } from '@/fixtures'

describe('AssetCard', () => {
  it('renders balance', () => {
    render(<AssetCard {...assetCommercialRealEstate} onTransferClick={jest.fn()} />)
    expect(screen.getByText(/50.50/)).toBeInTheDocument()
  })
})
```

### In stories / dev

```typescript
import { portfolioStandard, walletConnectedTestnet } from '@/fixtures'

// Use fixtures to preview components with standard data
export default {
  title: 'Portfolio/Standard',
  component: PortfolioList,
  args: { assets: portfolioStandard.assets },
}
```

## Conventions

1. **All addresses start with `G`** but are non-real patterns (contain "FOR-FIXTURE-ONLY").
2. **Never use actual wallet addresses, private keys, or tx hashes** in fixtures.
3. **Fixtures are immutable by default** — import and use directly, do not mutate.
4. **Each fixture file covers one domain** — keep wallet, compliance, and asset fixtures separate.
5. **Include edge cases** — zero balances, large numbers, empty states, error states.
6. **Export types alongside fixtures** — consumers can type-check against fixture shapes.

## Adding New Fixtures

1. Choose the appropriate file (or create a new one in `src/fixtures/`).
2. Export a named constant with a descriptive name.
3. Include a JSDoc comment explaining what the fixture represents.
4. Add a test in `__tests__/` validating the fixture's shape.
5. Re-export from `index.ts` if creating a new file.
