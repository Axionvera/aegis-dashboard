# Investor Transfer Eligibility Panel

Explains, per transfer direction, whether an investor can **send** or
**receive** a restricted asset — based on compliance status, asset status,
wallet network, and service availability. (Issue #55.)

## Why it exists
Investors often don't understand *why* a transfer is blocked or unavailable.
This panel surfaces a human-readable explanation instead of a bare error.

## States
| State | Meaning | Example trigger |
|-------|---------|-----------------|
| `compliant` | Appears allowed based on known info; final say is on-chain. | Verified wallet + supported network + asset compliant. |
| `blocked` | Transfer should not proceed. | Wallet not KYC-compliant, wrong network, or asset restriction. |
| `unknown` | Cannot verify — **does not** assert allow or block. | Compliance partially known or service unavailable. |
| `unavailable` | Asset temporarily not transferable (e.g. paused). | `assetPaused = true`. |

## Evaluation precedence (fail-closed)
1. Service unavailable → `unknown` (never claim compliant/blocked).
2. Asset paused → `unavailable`.
3. Wallet on unsupported network → `blocked`.
4. Asset non-compliant (per-asset) → `blocked`.
5. Wallet non-compliant → `blocked`.
6. Compliance partially known → `unknown`.
7. Otherwise → `compliant`.

## Copy guardrails (no legal overclaiming)
- The panel is **informational**; on-chain approval is final.
- `unknown` copy explicitly states it is *not* a confirmation of allow/block.
- No wording implies a legal or regulatory guarantee.

## Files
- `src/lib/eligibility.ts` — pure evaluation engine (no React; fully unit-tested).
- `src/lib/__fixtures__/eligibility.ts` — sample inputs for all major states.
- `src/features/investor/InvestorEligibilityPanel.tsx` — the UI panel.
- `src/lib/eligibility.test.ts` — engine unit tests.
- `src/features/investor/InvestorEligibilityPanel.test.tsx` — component tests.

## SDK mapping
The dashboard should feed real signals into `EligibilityInput`:
- `walletCompliant` ← KYC/whitelist check (e.g. `useAegis().checkWhitelist`).
- `walletOnSupportedNetwork` ← connected network vs asset's required network.
- `asset.compliant` / `asset.assetPaused` ← asset registry / contract read.
- `serviceAvailable` ← backend/SDK reachability.

Until those signals are wired, the panel can be rendered with `serviceAvailable: false`
to honestly show an `unknown` state rather than guessing.
