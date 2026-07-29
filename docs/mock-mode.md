# Mock Mode — Local Development Guide

Mock mode lets you run the full Aegis dashboard UI without a live Soroban RPC
endpoint or deployed contracts. Every SDK call is answered by a local in-memory
provider that returns deterministic fixture data.

This is the recommended starting point for all frontend contributors.

---

## Quick Start

1. Copy the example environment file and enable mock mode:

   ```bash
   cp .env.example .env.local
   ```

   Then open `.env.local` and set:

   ```env
   NEXT_PUBLIC_MOCK_MODE="true"
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

You will see an **amber warning banner** at the top of every page confirming
that mock mode is active. This banner is intentional — it makes synthetic data
unmistakable at a glance.

---

## What Changes in Mock Mode

| Area | Live mode | Mock mode |
|---|---|---|
| SDK provider | `LiveAegisProvider` (delegates to `client.ts`) | `MockAegisProvider` (returns fixtures) |
| Portfolio data | Real on-chain holdings | Fixture assets in `src/fixtures/portfolio.ts` |
| Whitelist checks | Real contract call | Heuristic: G-addresses > 50 chars → whitelisted |
| Transfer / mint | Real Soroban submission | Simulated with 600 ms latency per phase |
| Transaction outcomes | Network status | Amount-driven: `0.01`=fail, `0.02`=pending, `0.03`=unknown, else=success |
| Diagnostics page | Real env values | `[MOCK]` placeholder values, `LOCAL_MOCK` network |

The warning banner, the "Active Provider" row in Diagnostics, and the amber
callout box on the Diagnostics page all use `isProviderMocked()` from
`src/lib/sdk/index.ts`.

---

## Fixture Data

All fixture files live in `src/fixtures/`. They are imported only by
`MockAegisProvider` and tests — they are never bundled into a live deployment.

| File | What it contains |
|---|---|
| `portfolio.ts` | Four mock assets covering compliant, restricted, pending-review, and data-unavailable states |
| `compliance.ts` | Five mock compliance subjects covering all reviewable statuses |
| `transactions.ts` | Re-exports the canonical transaction history fixtures from `src/features/transactions/fixtures.ts` |
| `diagnostics.ts` | Mock diagnostics report with `[MOCK]` labels |
| `index.ts` | Barrel that re-exports all of the above |
| `flows.ts` | Named end-to-end investor journeys that link the files above together by address/asset — see [mock-flow-fixtures.md](mock-flow-fixtures.md) |

To add or change fixture data, edit the relevant file. Changes take effect
on the next hot reload — no server restart required.

---

## How the Provider Is Selected

The selection happens once at module load in `src/lib/sdk/index.ts`:

```
NEXT_PUBLIC_MOCK_MODE=true
        │
        ▼
  isMockModeEnabled()   ──true──►   assertMockModeSafe()   ──throws if NODE_ENV≠development──►  CRASH
        │                                   │ (passes in dev)
        │false                              ▼
        ▼                          MockAegisProvider  ◄── src/fixtures/portfolio.ts
  LiveAegisProvider                                        src/fixtures/compliance.ts
  (real RPC calls)                                         etc.
```

`assertMockModeSafe()` is a hard guard: if `NEXT_PUBLIC_MOCK_MODE=true` is
somehow set in a non-development `NODE_ENV`, it throws at startup and the app
will not load. This prevents accidental deployment of mock data.

All component code imports through `useAegis` → `getAegisProvider()`.
Nothing outside `src/lib/sdk/` needs to know which provider is active.

---

## Simulating Different Transaction Outcomes

The `MockAegisProvider` maps the transfer/mint `amount` to a specific outcome:

| Amount | Outcome |
|---|---|
| `0.01` | `FAILED` — compliance rejection error |
| `0.02` | `PENDING` — stuck in mempool |
| `0.03` | Unknown status (exercises the fallback UI path) |
| Any other value | `SUCCESS` |

This lets you exercise every receipt state without touching any code. On the
Admin page with the guided mint workflow (`newMintFlow`, default on), select an
asset, enter any G-address longer than 50 characters, and mint with one of
these amounts (0.01 / 0.02 / 0.03). See
[rwa-asset-minting-workflow.md](rwa-asset-minting-workflow.md).

---

## Safety Warnings

> **Mock mode must never be deployed to testnet or mainnet.**

- `assertMockModeSafe()` throws at startup if `NEXT_PUBLIC_MOCK_MODE=true` and
  `NODE_ENV !== 'development'`. This is a hard guard, not advisory.
- Do not commit `.env.local`. It is listed in `.gitignore`.
- No fixture data contains real addresses, real balances, or real compliance
  decisions. All Stellar-style addresses in fixtures are synthetic.
- The mock banner is not dismissible across page reloads. Any contributor
  visiting the app while mock mode is active will always see it on first load.

---

## Disabling Mock Mode

Remove or change the flag in `.env.local`:

```env
NEXT_PUBLIC_MOCK_MODE="false"
```

Then restart the dev server. The banner disappears, the Diagnostics page shows
real env values, and all SDK calls go through `LiveAegisProvider`.

---

## Related

- `src/lib/sdk/IAegisProvider.ts` — the interface both providers implement
- `src/lib/sdk/MockAegisProvider.ts` — mock provider implementation
- `src/lib/sdk/LiveAegisProvider.ts` — live provider (delegates to `client.ts`)
- `src/config/mockMode.ts` — `isMockModeEnabled()` and `assertMockModeSafe()`
- `src/hooks/useFeatureFlags.ts` — `mockMode` feature flag (UI toggle only; does not activate the SDK mock provider)
- `docs/feature-flags.md` — general feature flags documentation
- `docs/diagnostics.md` — diagnostics page reference