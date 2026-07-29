# Visual Regression Fixture Plan

This document defines the target screens, fixture states, and viewport
coverage needed to catch visual regressions across admin and investor
workflows. It's a planning document -- no visual-diff tooling is wired
up yet. See "Implementation plan" below for how this would be executed.

## Why this exists

UI changes (Tailwind class edits, shared component updates, layout
changes) can silently regress complex states across admin and investor
screens that aren't exercised by unit tests, since those tests assert
on DOM structure and behavior, not rendered appearance. This plan
defines a concrete, reviewable target for a future visual regression
suite (e.g. Playwright's toHaveScreenshot, or Chromatic/Percy against
Storybook).

## Target screens

Grouped by role, matching src/pages/*.tsx and the route guards in
[route-access.md](route-access.md).

### Investor screens

| Screen | Route | Page / primary components |
|---|---|---|
| Portfolio dashboard | /portfolio | src/pages/portfolio.tsx, PortfolioList, AssetCard |
| Transaction history | /transactions | src/pages/transactions.tsx, TransactionHistory, TableSortHeader, TableSearch, StatusFilter |
| Transfer flow | modal, from portfolio | TransactionReview, TransactionProgress, TransactionReceipt |
| Investor eligibility panel | embedded, portfolio/transfer | InvestorEligibilityPanel.tsx |

### Admin / issuer / compliance screens

| Screen | Route | Page / primary components |
|---|---|---|
| Admin panel | /admin | src/pages/admin.tsx, AdminPanel.tsx |
| Compliance review | /compliance | src/pages/compliance.tsx, BulkComplianceReview.tsx, ComplianceInfo.tsx |
| Issuer / asset registration | /issuer | src/pages/issuer.tsx |
| Feature flags panel | embedded, admin | FeatureFlagsPanel.tsx |
| Diagnostics | /diagnostics | src/pages/diagnostics.tsx, see diagnostics.md |

### Shared / cross-cutting

| Screen | Where it appears | Primary components |
|---|---|---|
| Empty states | Portfolio, transactions, compliance, admin (no-data/unavailable) | src/components/states/EmptyState.tsx, fixtures in src/components/states/fixtures.ts |
| Navigation | Every authenticated route | Navbar.tsx, MobileNav.tsx |
| Mock mode banner | Every route without live RPC | MockModeBanner.tsx, see mock-mode.md |
| Access unavailable / route guard | Any route when role check fails | AccessUnavailable.tsx, RouteGuard.tsx |

### Shared / cross-cutting

| Screen | Where it appears | Primary components |
|---|---|---|
| Empty states | Portfolio, transactions, compliance, admin (no-data/unavailable) | src/components/states/EmptyState.tsx, fixtures in src/components/states/fixtures.ts |
| Navigation | Every authenticated route | Navbar.tsx, MobileNav.tsx |
| Mock mode banner | Every route without live RPC | MockModeBanner.tsx, see mock-mode.md |
| Access unavailable / route guard | Any route when role check fails | AccessUnavailable.tsx, RouteGuard.tsx |

## Viewport coverage

No viewport convention is documented in design-guidelines.md beyond
"never use fixed pixel widths" -- this plan establishes one, aligned
to the Tailwind breakpoints already used throughout src/ (sm/md/lg):

| Name | Width | Tailwind breakpoint | Rationale |
|---|---|---|---|
| Mobile | 375px | below sm (640px) | MobileNav.tsx exists specifically for this range |
| Tablet | 768px | md (768px) | Common breakpoint for table-to-card layout shifts |
| Desktop | 1280px | lg (1024px) and above | Primary target; matches docs/screenshots/ |

Every screen in the Target Screens tables above should be captured at
all three widths at minimum. Screens with a table/card layout shift
(transaction history, compliance review) should also be captured at
1440px to confirm no clipping.

## Fixture states

Modeled on the existing emptyStateFixtures pattern in
src/components/states/fixtures.ts (icon, title, description, variant,
actions, docsLink). Each target screen should have fixtures covering
these state categories where applicable:

### Universal state categories

- Loading (skeleton/spinner)
- Empty / no-data
- Service unavailable / error (see EmptyState unavailable variant)
- Populated, single item
- Populated, many items (pagination/scroll boundary)
- Populated, long text overflow (long names, addresses, descriptions)

### Investor-specific states

- Portfolio: compliant, restricted, and pending-review asset compliance badges together in one view
- Portfolio: transfer-ineligible asset (see investor-transfer-eligibility.md)
- Transaction history: mixed operation types (mint, transfer, receive) in one table
- Transfer flow: in-progress, success, and failure receipt states

### Admin-specific states

- Compliance review: bulk selection with mixed approve/reject state
- Compliance review: KYC bulk import validation errors
- Admin panel: role management with multiple roles assigned
- Feature flags panel: mixed enabled/disabled flags
- Route guard: access-denied view for a non-admin role

## Implementation plan

This plan does not wire up a visual regression tool. Suggested phased
rollout for a future contribution:

1. **Tooling choice**: Playwright (already suitable for a Next.js
   pages-router app) with its built-in toHaveScreenshot assertion, run
   against mock-mode (see mock-mode.md) so screenshots are
   deterministic and don't depend on live Soroban RPC state.
2. **Fixture wiring**: reuse src/fixtures/*.ts and
   src/lib/__fixtures__/*.ts directly as the data source for each
   screenshot test, extended with the state categories above where a
   fixture doesn't yet cover them.
3. **Baseline capture**: one baseline screenshot per screen x state x
   viewport combination, committed to a test-snapshots directory.
4. **CI gate**: run on PRs touching src/components, src/features, or
   src/pages; fail on pixel diff above a defined threshold; upload
   diff images as a CI artifact for review.
5. **Maintenance**: baseline update requires explicit
   --update-snapshots plus reviewer sign-off, consistent with the
   review rigor in pr-evidence-checklist.md.

## Fixture usage today

Until the tooling above is implemented, this plan itself is the
reviewable artifact: when reviewing a UI PR, check its diff against
the "Target screens" and "Fixture states" tables above to confirm
affected states were exercised (manually or via existing fixtures in
src/fixtures/, src/lib/__fixtures__/, and
src/components/states/fixtures.ts).

## Related docs

- [design-guidelines.md](design-guidelines.md) -- colour, spacing,
  typography referenced by these screens
- [testing-standard.md](testing-standard.md) -- functional test
  coverage this plan complements, not replaces
- [mock-mode.md](mock-mode.md) -- how to run the dashboard
  deterministically for fixture capture
- [accessibility-checklist.md](accessibility-checklist.md) -- a11y
  targets that should hold across every state captured here
