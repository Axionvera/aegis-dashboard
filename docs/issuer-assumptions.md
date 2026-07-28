# Issuer Asset Registration — Assumptions & Notes

## Overview

The `/register-asset` page provides an issuer-facing UI to submit metadata for a new Real-World Asset (RWA) and prepare a signed Soroban registration transaction.

---

## Issuer Assumptions

1. **Wallet connected** — The issuer must have the Freighter browser extension installed and their Stellar account connected before the registration form is accessible.

2. **Issuer responsibility** — Aegis does **not** verify the legal status, ownership, or regulatory compliance of the underlying asset.  Issuers are solely responsible for ensuring their submissions comply with applicable laws and regulations in their jurisdiction.

3. **Document URI** — The `documentUri` field must reference a publicly accessible document (either via IPFS or HTTPS) that describes the asset (e.g., a prospectus, deed, or offering memorandum).  The protocol stores only the URI on-chain; the content is not validated.

4. **Ticker uniqueness** — The ticker symbol must be unique across the protocol. The UI performs an async availability check against the contract before allowing submission.

5. **Jurisdiction code** — The `jurisdiction` field accepts [ISO-3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes (e.g., `US`, `GB`, `DE`). This is used for informational display only and does not trigger jurisdiction-specific compliance logic on the contract side in the current version.

6. **Total supply is fixed at registration** — Once a supply is submitted and anchored on-chain, it cannot be changed through this UI. Administrative re-issuance flows are handled separately by protocol admins.

---

## Multi-Step Flow

| Step | Description |
|---|---|
| **1. Input** | Issuer fills in asset metadata fields with inline validation. |
| **2. Review** | Read-only summary displayed before any signing occurs. |
| **3. Receipt** | Success (tx hash + contract ID) or error state with retry option. |

---

## SDK Integration

All contract interactions are centralised in `src/lib/aegisSdk.ts`.  The `registerAsset()` function:

1. Builds the `register_asset` Soroban invocation XDR.
2. Requests a signature from Freighter via `signTransaction()`.
3. Submits the signed XDR to the Stellar Soroban RPC.
4. Polls for ledger inclusion and returns the transaction hash and contract ID.

> **Note:** The `@aegis/sdk` package is not yet published. `aegisSdk.ts` currently contains a mock implementation. Replace the mock bodies with real SDK calls once the package is available.

---

## Validation Rules (client-side)

| Field | Rule |
|---|---|
| `name` | Required; max 80 characters |
| `ticker` | Required; 2–12 uppercase letters, digits, or hyphens (`[A-Z0-9\-]{2,12}`) |
| `assetType` | Required; must be one of the predefined options |
| `totalSupply` | Required; positive whole number |
| `documentUri` | Required; must start with `ipfs://`, `http://`, or `https://` |
| `jurisdiction` | Required; 2-letter ISO-3166-1 alpha-2 code |
| `description` | Optional; max 500 characters |

---

## Development Fixtures

Pre-filled test data is available in `src/fixtures/assetFixtures.ts`.  Import `FIXTURE_REAL_ESTATE` or `FIXTURE_TREASURY` during local development to skip manual form entry.

---

## Legal Disclaimer

> Submitting an asset registration through this UI does **not** constitute legal verification, regulatory approval, or endorsement of the underlying asset by Aegis or its contributors.  All submitted metadata is stored as-is on the Stellar blockchain.
