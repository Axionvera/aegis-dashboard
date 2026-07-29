# Compliance Status Panel

Issue: [#175](https://github.com/Axionvera/aegis-dashboard/issues/175)

## Goal

Show investors and admins a clear, protocol-level compliance status for a wallet address.

Supported states:

- `approved`
- `blocked`
- `pending`
- `revoked`
- `unknown`
- `unavailable`

## Where It Appears

- Investor portfolio (`/portfolio`) — connected wallet status
- Admin dashboard (`/admin`) — connected wallet status plus address lookup

## Architecture

| Layer | Path | Responsibility |
|---|---|---|
| SDK contract | `src/lib/sdk/IAegisProvider.ts` | `getAddressCompliance(address)` |
| Mock / live providers | `src/lib/sdk/MockAegisProvider.ts`, `LiveAegisProvider.ts` | Centralised SDK access |
| Client stub | `src/lib/aegis/client.ts` | Live provider stub implementation |
| Hook | `src/hooks/useAegis.ts` | UI loading wrapper around provider |
| Mapper | `src/features/compliance/statusMap.ts` | Raw SDK record → panel model |
| Panel | `src/features/compliance/components/ComplianceStatusPanel.tsx` | Investor / admin UI |

SDK calls are centralised through `getAegisProvider().getAddressCompliance(...)`. Components never call Freighter or contract RPCs directly for this panel.

## Separation From Related Surfaces

| Surface | Vocabulary | Purpose |
|---|---|---|
| This panel | `approved` / `blocked` / `pending` / `revoked` / `unknown` / `unavailable` | Address-level registry status |
| Asset badge (`lib/aegis/types`) | `compliant` / `restricted` / `pending_review` | Per-holding portfolio badge |
| Bulk review (`lib/complianceReview`) | `pending` / `approved` / `rejected` / `review` | Admin KYC queue actions |
| Static legend (`types/compliance`) | Same six public states as this panel | Reference copy only |

Do not reuse transfer/onboarding eligibility (`evaluateEligibility`) for this panel.

## Status Meaning

| State | Meaning |
|---|---|
| Approved | Address is currently marked approved in the protocol registry |
| Blocked | Address is blocked from protocol actions |
| Pending | Review is still in progress |
| Revoked | Prior approval was revoked |
| Unknown | No clear record was returned |
| Unavailable | Registry / SDK data could not be retrieved |

## Copy Assumptions

- All explanations are **protocol-level only**.
- The panel always shows `COMPLIANCE_DISCLAIMER` from `src/lib/complianceReview.ts`.
- The panel explicitly states it does **not** perform real-world KYC.
- Copy must not claim legal approval, regulatory clearance, or financial advice.

See also: [Compliance-Safe Wording Guidance](compliance-safe-wording.md).

## Fixtures And Tests

- Fixtures: `src/features/compliance/fixtures.ts`
- Mapper tests: `src/features/compliance/statusMap.test.ts`
- Panel tests: `src/features/compliance/components/ComplianceStatusPanel.test.tsx`

## Mock Address Examples

- Approved: `GCFXCOMPAPPROVED0000000000000000000000000000000000000`
- Blocked: `GCFXCOMPBLOCKED00000000000000000000000000000000000000`
- Pending: `GCFXCOMPPENDING00000000000000000000000000000000000000`
- Revoked: `GCFXCOMPREVOKED000000000000000000000000000000000000000`
- Unknown: `GCFXCOMPUNKNOWN00000000000000000000000000000000000000`
- Unavailable: `GCFXCOMPUNAVAILABLE000000000000000000000000000000000`
