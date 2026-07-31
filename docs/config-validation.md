# Configuration Validation Guardrails

Related: Issue #8 — "Add dashboard network and contract configuration guardrails".
See also [`docs/environment-mismatch-blocking.md`](./environment-mismatch-blocking.md)
for the separate wallet-vs-target-network check, and
[`docs/mock-mode.md`](./mock-mode.md) for local development without a live RPC
endpoint.

## Why this exists

The dashboard is configured entirely through build-time env vars:

| Variable                          | Purpose                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_RPC_URL`               | Soroban RPC endpoint the SDK talks to                |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE`    | Which Stellar network the dashboard targets          |
| `NEXT_PUBLIC_AEGIS_CONTRACT_ID`     | The contract the dashboard reads from and signs to   |
| `NEXT_PUBLIC_MOCK_MODE`             | Bypasses all of the above for local frontend dev     |

A typo or copy-paste mistake in any of these (a malformed contract ID, a
placeholder value left over from `.env.example`, an unreachable-looking RPC
URL) previously only surfaced as an opaque runtime error once someone tried to
load data or sign a transaction — or worse, silently pointed the dashboard at
the wrong contract without any error at all.

`src/config/validate.ts` checks the **shape** of these variables at app
startup and fails loudly, before any page renders, if something's wrong.

## What is and isn't checked

Validation is a shape/format check only:

- **RPC URL** — must parse as a URL. Must be HTTPS unless it's `localhost` /
  `127.0.0.1` (dev only).
- **Network passphrase** — must be present. Warns (non-blocking) if it isn't
  one of the two known Stellar passphrases, since custom standalone networks
  are a legitimate use case.
- **Contract ID** — must be present and match the 56-character Soroban
  contract ID shape (`C` followed by 55 base32 characters).

It does **not** check that the RPC endpoint is reachable, that the contract is
actually deployed, or that the contract ID belongs to the network you think
it does — those are runtime concerns, not config concerns, and are surfaced
separately (e.g. failed SDK calls, or the wallet-network mismatch screen).

## Errors vs. warnings

- **Errors** block the dashboard entirely via `ConfigErrorScreen` — nothing
  else renders until they're fixed. Missing/malformed RPC URL, missing
  passphrase, and missing/malformed contract ID are all errors.
- **Warnings** are informational only and never block. Non-HTTPS remote RPC
  URLs and unrecognized (custom) passphrases are warnings, since they can be
  intentional.

## Mock mode bypasses validation entirely

When `NEXT_PUBLIC_MOCK_MODE="true"`, `validateDashboardConfig()` returns
valid with no issues regardless of what else is set. Mock mode already makes
no real RPC or contract calls, so there's nothing to validate — see
`docs/mock-mode.md`.

## Where to see it

- **Startup block**: `ConfigGuard` in `src/pages/_app.tsx` renders
  `ConfigErrorScreen` when validation fails, before `EnvironmentGuard` (the
  wallet-network mismatch check) even runs.
- **Always-on banner**: `EnvironmentBanner` (`src/components/EnvironmentBanner.tsx`)
  shows the current target network and a redacted contract ID on every page,
  so you always know which environment you're pointed at — separate from the
  mock-mode banner and the mismatch-blocking screen.
- **Diagnostics**: the "Config Validation" card in `DiagnosticsPanel` shows a
  non-sensitive summary (valid/invalid, issue counts, and which field names
  have issues — never raw values) that's safe to include in a copied
  diagnostics report.

## Fixing a validation error

1. Open the `ConfigErrorScreen` message — it names the exact env var and what's
   wrong with it.
2. Update the value in your `.env.local` (see `.env.example` for the expected
   format of each variable).
3. Restart the dev server (Next.js inlines `NEXT_PUBLIC_*` vars at build time,
   so changes to `.env.local` require a restart to take effect).

If you don't have real RPC/contract config yet (e.g. you're just working on
UI), set `NEXT_PUBLIC_MOCK_MODE="true"` instead of trying to fill these in
with placeholder values.