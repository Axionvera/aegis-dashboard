# Transaction History Normalization

## Goal
The dashboard consumes transaction-like data from multiple sources with incompatible shapes:
- SDK receipt responses
- Contract event payloads
- Placeholder records (pending/manual/admin notes)

To support audit and compliance workflows, the dashboard now normalizes every record into a shared `NormalizedTransaction` model.

## Normalized Fields
Every normalized record includes:
- `status`
- `actor`
- `target`
- `operation`
- `hash`
- `timestamp`

Additional optional metadata is preserved (`assetTicker`, `amount`, `notes`, `raw`, `source`) to support future detail panels and exports.

## Supported Operation Coverage
The normalization logic explicitly covers:
- `compliance_update`
- `mint`
- `transfer`
- `asset_registration`
- `admin_action`

## Data Source Limitations
- Receipt and event payloads are currently mocked in the dashboard.
- Mock hashes and timestamps are generated client-side for local UX simulation.
- Real-world ordering and finality guarantees depend on upstream RPC/event indexing and are not yet guaranteed by this frontend-only layer.
- Unknown or malformed source values are safely mapped to fallback values instead of failing render paths.

## UI Integration
- `src/pages/transactions.tsx` exposes a transaction history page.
- `src/components/TransactionHistory.tsx` provides:
  - filter chips (status and operation)
  - text search
  - normalized list
  - detail panel for selected records

## Fixtures And Tests
- Fixtures: `src/features/transactions/fixtures.ts`
- Unit tests:
  - `src/features/transactions/normalize.test.ts`
  - `src/features/transactions/filters.test.ts`
