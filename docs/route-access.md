# Dashboard Route Access

## Goal
Protect role-specific dashboard sections with UI-level guards that explain why access is blocked.

Supported roles:
- `admin`
- `issuer`
- `investor`
- `read_only`

## Route Mapping
- `/portfolio` -> investor, issuer, admin
- `/transactions` -> investor, issuer, admin, read_only
- `/issuer` -> issuer, admin
- `/admin` -> admin

This keeps admin and investor sections distinct while allowing read-only wallets to inspect transaction history.

## Guard Flow
1. Wallet connection is required for protected routes.
2. Role is resolved through a mock SDK lookup (`resolveWalletRole`) exposed via `useAegis.getWalletRole`.
3. `evaluateRouteAccess` returns one of:
   - `wallet_required`
   - `role_loading`
   - `role_unavailable`
   - `allowed`
4. `RouteGuard` renders page content or `AccessUnavailable` fallback UI.

## Access Assumptions
- Role resolution is currently mocked using fixture wallet addresses and simple address heuristics.
- UI guards improve safety and UX but **do not replace contract-level authorization**.
- A connected wallet with no recognized role is treated as unavailable for protected routes.
- Navbar links are filtered to only show routes the current role can access.

## Fixtures And Tests
- Role fixtures: `src/features/auth/fixtures.ts`
- Route guard tests: `src/lib/route-guard.test.ts`
- Role resolver tests: `src/features/auth/resolveRole.test.ts`

## Mock Wallet Examples
- Admin: `GCFXADMIN00000000000000000000000000000000000000000000`
- Issuer: `GCFXISSUER0000000000000000000000000000000000000000000`
- Investor: `GCFXUSERALICE0000000000000000000000000000000000000000`
- Read-only: `GCFXREADONLY00000000000000000000000000000000000000000`
