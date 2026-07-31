# Shared Status System

`src/lib/status/` and `src/components/status/` provide one consistent way to
label, colour, and prioritise a status — used across the compliance, asset,
transaction, wallet, and diagnostics screens instead of each one defining
its own colour map.

## The problem this solves

Before this, several components each hardcoded their own
`Record<SomeState, string>` of Tailwind classes for the same visual idea:

- `ComplianceBadge.tsx`, `AssetLifecycleBadge.tsx` — bordered badges
- `IssuanceRequestsTable.tsx` — a pill badge with its own status colours
- `WhitelistManager.tsx` — an inline whitelisted/revoked badge
- `StatusCard.tsx` (Diagnostics) — a card with its own `statusColors` map

Nothing kept these in sync. "Critical" could be `red` in one place and
`rose` in another purely by accident, and a new screen had no obvious
existing pattern to copy.

## How it's structured

```
src/lib/status/
  types.ts          StatusTone, StatusSeverity, StatusInfo
  severity.ts        tone <-> severity mapping, sorting/threshold helpers
  toneStyles.ts       Tailwind classes per tone, per variant (pill/outline/card)
  domainMappers.ts    one function per domain: domain status -> StatusInfo
  index.ts            barrel

src/components/status/
  StatusBadge.tsx     renders a StatusInfo as a badge (pill or outline)
  index.ts            barrel
```

**`StatusTone`** (`'success' | 'neutral' | 'caution' | 'critical' | 'unknown'`)
is the visual/semantic category. **`StatusSeverity`**
(`'none' | 'low' | 'medium' | 'high' | 'critical'`) is how urgently a status
needs attention — useful for sorting a table by "what needs review first"
across mixed status types. Every tone has a default severity
(`TONE_SEVERITY` in `severity.ts`).

A **domain mapper** converts an existing domain status value into a
`StatusInfo`. No domain's own status type changes — `ComplianceState`,
`AssetLifecycleState`, `TransactionStatus`, `WhitelistEntryStatus`, etc. all
still live where they always did. The mapper is purely a translation into
the shared display layer:

```ts
import { statusForComplianceState } from '@/lib/status';

statusForComplianceState('restricted');
// => { label: 'Restricted', tone: 'critical', severity: 'critical', detail: '...' }
```

Covered domains and their mapper functions:

| Domain | Source type | Mapper |
|---|---|---|
| Compliance | `ComplianceState` (`src/lib/aegis/types.ts`) | `statusForComplianceState` |
| Compliance review severity | `ReviewSeverity` (`src/lib/complianceReview.ts`) | `statusForReviewSeverity` |
| Asset — transfer eligibility | `TransferEligibilityState` (`src/lib/aegis/types.ts`) | `statusForTransferEligibility` |
| Asset — lifecycle | `AssetLifecycleState` (`src/lib/assetLifecycle.ts`) | `statusForAssetLifecycle` |
| Asset — issuance request | `IssuanceRequest['status']` (`src/fixtures/issuer.ts`) | `statusForIssuanceRequest` |
| Transaction | `TransactionStatus` (`src/features/transactions/types.ts`) | `statusForTransaction` |
| Wallet — KYC whitelist | `WhitelistEntryStatus` (`src/lib/whitelist.ts`) | `statusForWhitelistEntry` |
| Diagnostics | `DiagnosticsCardStatus` (`'ok' \| 'warning' \| 'error' \| 'unknown'`) | `statusForDiagnostics` |

## Rendering a status

```tsx
import { StatusBadge } from '@/components/status';
import { statusForTransaction } from '@/lib/status';

<StatusBadge status={statusForTransaction(tx.status)} variant="pill" />
```

`variant` is `'outline'` (bordered rectangle, default) or `'pill'`
(rounded-full). Each tone gets a matching icon automatically (check circle
for success, triangle for caution, X for critical, question mark for
unknown, minus for neutral) — pass `showIcon={false}` to omit it.

The Diagnostics `StatusCard` component has its own title/value card layout
that predates `StatusBadge`, so rather than force it through the badge
component it consumes the tone class tokens directly:

```ts
import { toneClassName } from '@/lib/status/toneStyles';
toneClassName(tone, 'card');
```

## Screens currently using the shared system

- `src/features/diagnostics/components/StatusCard.tsx`
- `src/features/issuer/components/IssuanceRequestsTable.tsx`
- `src/features/compliance/components/WhitelistManager.tsx`

`ComplianceBadge.tsx`, `TransferEligibilityBadge.tsx`, and
`AssetLifecycleBadge.tsx` were left as-is for this change (they already had
a reasonably consistent internal pattern) but are natural next candidates
to migrate onto `StatusBadge` — their domain mappers
(`statusForComplianceState`, `statusForTransferEligibility`,
`statusForAssetLifecycle`) already exist and are ready to use.

## Adding a new domain

1. Add a `statusForYourDomain(state: YourDomainState): StatusInfo` function
   to `domainMappers.ts`, choosing the tone that matches its real-world
   urgency (see the table above for precedent).
2. Export it from `src/lib/status/index.ts`.
3. Add test cases to `domainMappers.test.ts` covering every value of your
   domain's status enum, and a couple of semantic assertions (e.g. "a
   rejected state must never map to a success tone").
4. Use `<StatusBadge status={statusForYourDomain(value)} />` wherever the
   status needs to render.

## Tailwind content scanning

`toneStyles.ts` lives in `src/lib/status/`, which contains literal Tailwind
class strings (not JSX). `tailwind.config.js`'s `content` array had to be
updated to include `./src/lib/**/*.{js,ts,jsx,tsx,mdx}` — without this, the
classes in `toneStyles.ts` would be silently purged from the production
build (see the note in `CONTRIBUTING.md` about adding new component
directories to the Tailwind content scan).

## Related

- `src/lib/status/` — implementation
- `src/lib/status/domainMappers.test.ts`, `src/lib/status/severity.test.ts` — tests
- `src/components/status/StatusBadge.test.tsx` — component smoke tests
- `docs/asset-lifecycle-status.md` — the pre-existing `LifecycleTone` pattern
  this system generalises
