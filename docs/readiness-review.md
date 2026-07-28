# Aegis Dashboard — Architecture & Security Readiness Review

> Closes: #24 · Type: Documentation · Difficulty: Expert
>
> Authored against the current `main` branch of `aegis-dashboard`. This review
> is an honest, MVP-flavoured assessment. It is not an audit of the
> on-chain contracts — only the dashboard application boundary.

## 1. Executive Summary

Aegis RWA Dashboard is a small Next.js 14 (pages router) application that
presents an institutional narrative (minting, KYC, Freighter wallet, Soroban)
against an MVP interior: the `@aegis/sdk` is entirely mocked, the
admin route is **not** guarded by an authority check, KYC is enforced only
in the UI, the amount parser is `parseFloat`, and there are zero tests.

The dashboard is **not release-ready for any environment moving real value**.
It can be safely used as a UX/design prototype on Testnet behind clearly
labelled disclaimer banners. Bridging to Mainnet requires closing every
Critical and High finding below, plus introducing a CI gate so they stay
closed.

| Area                       | Verdict                              |
| -------------------------- | ------------------------------------ |
| Routing & page composition | Adequate for MVP                      |
| State management           | Adequate (zustand) but no persistence |
| SDK integration            | **Blocked — SDK is mocked**           |
| Freighter integration      | Functional but no network guard       |
| Admin authorization        | **Broken** (presence-only check)       |
| Compliance enforcement     | **Bypassable** (UI-only)              |
| Numeric correctness        | **Risky** (`parseFloat` for amounts) |
| Tests                      | **None** — Critical release blocker    |
| CI / quality gates         | **None**                              |
| Diagnostics / observability| None (only `console.error`)           |

## 2. Scope & Methodology

Reviewed:

- `src/pages/*` (4 files): routing, page-level guards, head metadata
- `src/components/*` (5 files): presentational + interactive UI
- `src/hooks/*` (2 files): wallet and SDK abstractions
- `src/utils/formatting.ts`: shared helpers
- `src/styles/globals.css`, `tailwind.config.js`: styling surface
- `tsconfig.json`, `package.json`: type + dependency surface
- `docs/architecture.md`, `docs/frontend-guide.md`, `CONTRIBUTING.md`,
  `README.md`: documented conventions

Not in scope (file pointers in the issue that do not currently exist):

- `src/features/`, `src/lib/`, `app/` — not present in this branch
- Backend services, the on-chain contract, the `@aegis/sdk` internals — only
  how the dashboard *uses* them.

Each finding is labelled **Critical / High / Medium / Low / Info**, scoped
to a file pointer, justified, and paired with a one-line remediation. The
final section is a release-readiness roadmap that an issue tracker can
re-import verbatim.

## 3. Current Architecture Snapshot

### 3.1 Routing (`src/pages/`)

| Route     | Access control                       | Notes                                                                 |
| --------- | ------------------------------------ | --------------------------------------------------------------------- |
| `/`       | Public                               | Static landing page; renders CTAs to `/portfolio` and an external GitHub link. Acceptable. |
| `/portfolio` | Presence-only (`!address`)         | Shows "Please connect your wallet" if disconnected. **No role check needed** (investor page). |
| `/admin`  | Presence-only (`!address`)           | **Critical gap**: any connected wallet reaches `AdminPanel`.        |
| `_app.tsx`| Global shell                         | Wraps everything in `<Navbar/>` + main container. No error boundary. |

State stays local wherever it can: pages own route-level guards, components
own ephemeral form state (`useState`). Good. However, the absence of an error
boundary means any uncaught render exception will unmount the entire tree
and leave the user with a blank tab.

### 3.2 State Management (`src/hooks/useWallet.ts`)

- Zustand store with **three state fields** (`address`, `network`,
  `isConnecting`) and **two actions** (`connect`, `disconnect`).
- `connect()` calls `isConnected()` → `requestAccess()` → `getNetwork()` and
  triages errors to `console.error`. Acceptable shape.
- **TODO** in source: "implement wallet auto-reconnect on page refresh".
  Without it, every F5 forces the user to click **Connect Wallet** again.
- `network` is read and stored but never consulted against an expected value
  (see §6–F5).

### 3.3 SDK Integration (`src/hooks/useAegis.ts`)

The whole module is a mock. The `@aegis/sdk` import is commented out:

```ts
// import { AegisClient } from '@aegis/sdk'; // Mocked for now
```

Three exported functions — `checkWhitelist`, `transfer`, `mint` — wait 0.8s /
1.5s on `setTimeout` and return constants or fabricated transaction hashes.
This is fine for a Figma-clone demo; it is a blocker for any deployment that
touches a real network.

### 3.4 Freighter (`@stellar/freighter-api`)

- Imports `isConnected`, `requestAccess`, `getNetwork` from Freighter v2.
- The shape returned from `getNetwork()` is typed as `string` here but
  upstream it varies by Freighter version (e.g. `{ network: "PUBLIC" }`,
  `"TESTNET"`, or `"PUBLIC NET"`). See §6–F5.
- The detection is fire-and-forget; nothing is asserted.

### 3.5 SSR & Freighter

- Freighter is browser-only. `src/components/Navbar.tsx` reads wallet state
  from the zustand store without guarding against SSR. Today `Navbar` does
  not call `requestAccess`/`getNetwork` directly during render — those are
  invoked via a click handler on **Connect Wallet** — but any future
  server-side invocation will throw. Until the wallet hook is locked down,
  gate any direct Freighter call with an `isClient` mount check (or
  `useEffect`) so SSR-rendered HTML never triggers the Freighter API. Tied
  to F14.

### 3.6 Styling & Type Safety

- Tailwind with a custom `aegis.{brand,dark,accent}` palette in
  `tailwind.config.js`. Consistent across components.
- `tsconfig.json` is strict (`"strict": true`) but `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, and `noImplicitOverride` are **not** enabled.
- No Prettier, no `lint-staged`, no formatting benchmark in `package.json`.

## 4. Security-Sensitive Flows

### 4.1 Admin authorization — **Critical**

**Where:** `src/pages/admin.tsx`

```tsx
if (!address) {
  return <h2>Admin Access Required</h2>;
}
return <AdminPanel />;
```

A comment promises the real check: "verify address against contract admin key".
Until that exists, the admin route is open to **any** Stellar account with
Freighter. Even if the contract correctly reverts unauthorized mints, this
exposes the entire admin attack surface to users who should never see it,
wastes gas on transactions that will fail, and trains users to ignore the
guard.

**Remediation:** Drive the role check from a server-side source of truth.
Acceptable MVP variants in order of preference:

1. Backend endpoint (Next.js API route) that reads on-chain admin list and
   signs a short-lived JWT.
2. Read admin list directly from Soroban in a guarded `getAdmin()` call
   before render, behind a try/catch that re-routes to a 403 page.
3. Hard-coded allow-list in `NEXT_PUBLIC_ADMIN_ADDRESSES` (worst; only for
   pre-mainnet demos).

### 4.2 Compliance / KYC enforcement — **Critical**

**Where:** `src/components/TransferModal.tsx`, `src/hooks/useAegis.ts`

```ts
const isCompliant = await checkWhitelist(recipient);
if (!isCompliant) return setError("Recipient is not KYC whitelisted.");
await transfer(recipient, parseFloat(amount));
```

This is a UX gate, not a security gate. An attacker — or an internal tool —
that talks to the contract directly bypasses the UI, sends a non-whitelisted
recipient, and the contract must independently refuse. If the on-chain
transfer lacks an auth/allowlist check, the dashboard UI lulls operators
into a false sense of control.

**Remediation:**

- Treat the UI check as a fast-fail UX nicety only.
- Verify (in writing, in the contract repo) that `transfer` reverts unless
  `sender && recipient ∈ whitelist`. Add a contract-level integration test.
- Surface the actual on-chain revert reason on `setError` rather than a
  generic "Transaction failed".

### 4.3 Numeric correctness for amounts — **High**

**Where:** `src/components/TransferModal.tsx`

```ts
await transfer(recipient, parseFloat(amount));
```

`parseFloat` returns an IEEE-754 double. RWA ledgers expect either integer
stroops (`amount * 10^decimals`) or, for SAC tokens, the same. Doubles cannot
represent `0.1`, `0.2`, or anything beyond ~15 significant digits exactly.
This causes silent rounding on the way to the ledger and rejected
transactions on the way back.

**Remediation:** Parse to a `BigInt` of stroops in the UI, e.g.:

```ts
const decimals = await sdk.assetDecimals(ticker);
const stroops = BigInt(Math.round(Number(amount) * 10 ** decimals));
```

or use a big-number library (`bignumber.js`, `decimal.js`, or the SDK's own
helpers if provided). Never call `parseFloat` on a value that will be
authoritative on-chain.

### 4.4 Input validation in transfer flow — **High**

**Where:** `src/components/TransferModal.tsx`

```ts
if (!recipient || !amount) return setError("Fill all fields");
```

Validation today accepts:

- Negative numbers (`<input type="number">` allows `-1`).
- Zero amounts (`0` triggers a call that almost always reverts).
- Amounts larger than the user's balance (waste gas/fees on a known reject).
- Strings prefixed with whitespace, with leading zeros, or in scientific
  notation (`1e10`).
- Recipient addresses that are not Stellar public keys (e.g. contract IDs,
  muxed accounts, memos pasted in).

**Remediation:**

- Hard assert `Number(amount) > 0` and `Number(amount) <= balance`.
- Trim and validate recipient with `StrKey.isValidEd25519PublicKey`
  (@stellar/stellar-sdk) before opening the modal.
- Disable the **Confirm Transfer** button rather than relying on a runtime
  error string.

### 4.5 Missing network guard — **High**

**Where:** `src/hooks/useWallet.ts`, `src/components/Navbar.tsx`

`getNetwork()` is read and stored, but never compared to an expected
network. A user on Mainnet can sign a transaction aimed at a Testnet contract
and pay Mainnet fees for a guaranteed rejection. The reverse is also
plausible: a Testnet user signing a payload addressed to Mainnet during a
demo.

**Remediation:**

- Store expected network in `NEXT_PUBLIC_STELLAR_NETWORK`.
- After `connect`, compute a normalized string
  (`publicnet | testnet | futurenet`) and compare.
- On mismatch, render a banner in `<Navbar/>` blocking any signing action
  until the user switches networks in Freighter.

### 4.6 Address handling helpers — **Low**

**Where:** `src/utils/formatting.ts`

```ts
export const truncateAddress = (address: string): string => {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};
```

- Returns the un-truncated address if it is shorter than 12 chars. For an
  Ed25519 public key this cannot happen, but defensive copy without UI
  indication is not safe if an arbitrary ID ever lands here (e.g. a future
  muxed account address).
- The function does not natively handle a `null` input beyond the falsy
  early-return — fine today, fragile under tightening type signatures.
- No SSR guard: callers must be ready for `undefined` on first render.

**Remediation:** Tighten to a typed signature
`(address: string | null) => string` with an explicit `—` placeholder when
the address is falsy.

### 4.7 Admin mint inputs — **Medium**

**Where:** `src/components/AdminPanel.tsx`

```ts
await mint(address, 1000);
```

The amount is a hard-coded `1000`. There is no amount input on the form and
no validation on `address`. An admin who fat-fingers a recipient into this
field will mint 1000 tokens to an unintended address with no confirmation.

**Remediation:**

- Add a numeric `<input>` for the mint amount with the validation rules
  above (§4.3, §4.4).
- Show a confirmation modal that names the **exact** recipient and amount
  before the transaction is signed.
- Surface the eventual on-chain `txHash` and link to a Stellar Explorer URL.

### 4.8 Error feedback — **Low**

`alert(...)` is used in `connect()`, `handleWhitelist`, `handleMint`, and on
successful transfer. Alerts block the main thread, look unprofessional, and
provide no recovery path. Replace with a toast system
(`react-hot-toast`, `sonner`, or a thin in-house component) and disable the
relevant buttons while the action is in flight — currently only `Transfer`
respects `isLoading`; whitelist and "connect your wallet" CTAs do not.

## 5. Missing Test Coverage

There are **zero** tests. The repo contains no `vitest`, `jest`, `@testing-library/react`,
`playwright`, or `cypress` dependency. There is no `__tests__/`, `*.spec.ts`,
or `*.test.tsx` file in the tree.

### 5.1 Unit tests (priority: high)

Required for every public helper and/or value transform where a regression
fails closed (loss of funds, broken UI):

| Target                              | Cases the test must cover |
| ----------------------------------- | ------------------------- |
| `src/utils/formatting.ts::truncateAddress` | `null`, `""`, short string, exactly 56 chars, 100 chars, non-string `as any` (defensive). |
| `src/utils/formatting.ts::formatAmount` | `0`, `0.001` (min decimals), large numbers (`1e12`), negative, locale edge (grouping). |
| `src/hooks/useAegis.ts::checkWhitelist` (mock) | empty input, valid shader, invalid length, valid length with `StartsWith('G')`. |
| Amount parser introduced per §4.3 | `0`, `0.1`, very small fractions, max precisions, non-finite `NaN`, scientific notation. |
| `src/hooks/useWallet.ts::connect` (mocked Freighter) | happy path, user reject, network error, already connected, not-installed. |

### 5.2 Component tests (priority: high)

Use `@testing-library/react` for:

- `Navbar`: connect → connected state → truncated address; disconnect → empty
  button; the disabled "Connecting..." state.
- `TransferModal`: validation errors, KYC reject path, success path,
  unrecoverable error path. Mocks `useAegis`.
- `AdminPanel`: disabled states, success alert replacement.
- `PortfolioList`: empty state (no assets), single asset, multiple assets,
  transfer-recipient open/close cycle.

### 5.3 Integration tests (priority: medium)

Run with the real `@aegis/sdk` against a Soroban localnet container:

1. Connect (mocked Freighter).
2. Mint to recipient X.
3. Recipient mints to recipient Y after passing `checkWhitelist`.
4. Recipient attempts to mint to non-whitelisted Z → reverts.
5. Transfer attempts to mint more than balance → reverts.

### 5.4 End-to-end tests (priority: medium before launch)

Playwright suite that drives a real Freighter mock:

- Landing → portfolio → connect → portfolio loaded.
- Portfolio → asset → Transfer → fill form → confirm → tx hash visible.
- Portfolio → Admin (positive auth path) → Mint → confirmation modal → tx
  hash visible.
- Admin (negative auth path) → 403 / "Admin Access Required" with telemetry
  event.

### 5.5 Tooling additions

- `vitest` + `@vitejs/plugin-react` for unit/component.
- `@stellar/stellar-sdk` (or the real `@aegis/sdk`) in test deps only.
- `playwright` for e2e.
- `c8` or `vitest --coverage` for the coverage gate.
- A "Files or Areas Likely Affected" entry in `CONTRIBUTING.md` that codifies
  "every PR touching a hook or a money path must include tests".

### 5.6 Severity recap

**No tests on a financial dApp is a Critical release blocker**, not a todo
item. F0 in §11 gates the rest of the test work; F6 wires the test runner
into that gate. Skip both at your peril.

## 6. SDK Integration Risks

### 6.1 SDK is mocked **and** undeclared in dependencies — **High**

`src/hooks/useAegis.ts` ships as a mock with `setTimeout`-based latencies and
fabricated transaction hashes. The source comment

```ts
// import { AegisClient } from '@aegis/sdk'; // Mocked for now
```

is consistent with `package.json` containing **no** `@aegis/sdk` entry — not
in `dependencies`, not in `devDependencies`. So the dashboard is not only
functionally mocked; the SDK it will eventually need is also not pinned or
imported.

Any introduction of the real SDK must line up with:

- A version-pinned dependency (`"@aegis/sdk": "<exact-version>"`) plus a
  matching `package-lock.json` entry.
- Strict response types generated from the contract spec — not ambient
  `any`.
- Re-derivation of the `txHash` from the submitted envelope, not a string
  sentinel.
- Retry on dropped RPC responses (Soroban RPC occasionally returns
  `PENDING`, `NOT_FOUND`, and `TRY_AGAIN_LATER`).
- Submission through `WalletConnect`-style flows if multi-wallet support is
  on the roadmap.

F3 (§11) must bundle the install + the codegen + the type cleanup together
so they land atomically.

### 6.2 Type safety on return shapes — **Medium**

`useAegis` returns plain `Promise<string>` for `transfer` and `mint`. Once
the real SDK is wired in, those should be discriminated unions
(`{ ok: true; hash } | { ok: false; reason }`) so that UI code never assumes
success.

`getNetwork()` typing as `string` (in `useWallet.ts`) is too loose. Type it
as `StellarNetwork = 'PUBLIC' | 'TESTNET' | 'FUTURENET'` and normalize before
comparing.

### 6.3 Numeric precision (recap) — **High**

See §4.3. The SDK will not save us: a `BigInt` somewhere downstream still
relies on us delivering an integer.

### 6.4 Error handling — **Medium**

`try/catch` exists in `TransferModal` but the failure path is `setError`
with a generic message. The on-chain revert reason is dropped. Surface it.

### 6.5 Soroban RPC observability — **Info**

Plan to log every `submitTransaction` call (tx hash, source account, fee,
sequence number) into a single telemetry stream. Without that, debugging a
"transaction failed" support ticket in production is impossible.

### 6.6 Response-shape contract for portfolio — **Medium**

`src/components/PortfolioList.tsx` is mocked with
`{ id, name, ticker, balance }`. The real SDK response will need
additional fields: `decimals`, `contractAddress`, `allowlistStatus`,
`lastUpdated`, `icon`. Define an `Asset` interface (in a new
`src/types/asset.ts` or co-located with the SDK import) before swapping the
mock so the migration is type-checked rather than text-substituted.
Prefer SDK-provided types once F3 lands rather than hand-rolling to avoid
duplication.

## 7. Admin UX Risks

1. **No role redundant check** — even if the route guard is added, the
   `AdminPanel` should also assert `address ∈ admins` before exposing mint
   controls. Defense in depth.
2. **No amount input / no confirmation modal** — see §4.7. A wrong address
   + `mint` is **unrecoverable** on Stellar.
3. **No audit trail** — admin actions do not currently write to any local
   audit log. At minimum, log to console with an obvious marker (`[admin]`)
   and, in production, to a server-side append-only log.
4. **Placeholder whitelist button** — `src/components/AdminPanel.tsx`
   implements `handleWhitelist` as `alert(...)`. Replace with the actual
   contract call before admins can do nothing productive on this page.
5. **`@aegis/sdk` admin functions not yet surfaced** — there is no
   `revokeWhitelist`, `pauseContract`, `setPolicy`, etc. Decisions about
   which admin operations to expose belong in a follow-up issue, not in
   ad-hoc PRs.

## 8. Investor UX Risks

1. **Wallet does not auto-reconnect** — every refresh requires a click.
   Replace with a `useEffect` that checks `isConnected()` on mount and,
   when true, calls `requestAccess()` once.
2. **Mock asset list** — `PortfolioList` renders a hard-coded two-asset
   array. The first thing an investor does after connect is see data that
   does not match their wallet. Replace with a `usePortfolio(address)` hook
   that reads from the SDK with skeleton loading states.
3. **No skeleton loading** — explicit TODO. Skeletons are part of release
4. **No empty state** — what does an investor on Testnet with no balances
   see? TBD.
5. **Network mismatch UX** — once §4.5 is implemented, the navbar should
   show a yellow banner instead of silently allowing the destructive action.
6. **Truncate address returns full string for short inputs** — see §4.6.
7. **Alert spam** — replace all four alert sites with a toast system.

## 9. Diagnostics & Observability Gaps

There is no error boundary in `_app.tsx`, no structured logger, no
telemetry, and the only error sink is `console.error`. Adding:

- `ErrorBoundary` at the root that renders a graceful fallback with a
  "Copy diagnostics" button.
- A `<DiagnosticsProvider/>` that wraps `window.onerror` and
  `unhandledrejection` listeners.
- Per-action breadcrumbs (`connect`, `mint`, `transfer`, `whitelist`) with
  timestamps.
- An opt-in telemetry sink (Sentry / Datadog RUM) that respects the user
  privacy policy.

closes a class of "the page just disappeared" support tickets that
institutional clients will not tolerate.

## 10. Build & Release Readiness

| Gate                               | Status   | Action |
| ---------------------------------- | -------- | ------ |
| `npm run lint`                     | Available (`next lint`) but not enforced in CI. | Wire into GitHub Actions on every PR. |
| `tsc --noEmit` (`next build` covers it) | Available but not enforced. | Add step `npx tsc --noEmit` to CI. |
| Type-check on test files           | No tests. | Blocked on §5. |
| Test coverage threshold            | None.    | Require ≥80% on critical files (`useWallet.ts`, `useAegis.ts`, `TransferModal.tsx`, `AdminPanel.tsx`). |
| Pre-commit hooks (Prettier, ESLint) | None.   | Add `lint-staged` + `husky`. |
| Branch protection on `main`        | Unknown. | Require passing CI + 1 approval. |
| `.gitignore` cleanliness           | `.next/`, `node_modules/` are untracked locally but there is no committed `.gitignore` baseline; `next-env.d.ts` and `package-lock.json` are also untracked. | Commit a baseline `.gitignore` that ignores `.next/`, `node_modules/`, `next-env.d.ts`. Commit `package-lock.json`. |
| `package-lock.json`                | Untracked locally. | Commit it; pin transitive deps. |
| CI secrets management              | None.    | Configure GitHub Secrets for any non-public env (`NEXT_PUBLIC_*`). |

## 11. Recommended Follow-up Issues

Each row is sized to be a single PR. Severity / owner are placeholders.

| #   | Title                                                                       | Severity | Estimate | Force-multiplier? |
| --- | --------------------------------------------------------------------------- | -------- | -------- | :--------------: |
| F0  | Wire CI: lint + typecheck + test on every PR **before any feature lands**   | High     | S        | ✓ (gates F1–F8)   |
| F1  | Enforce admin authorization on `/admin` (server-side or contract-driven)   | Critical | M        |                  |
| F2  | Mandate on-chain compliance check + surface revert reason in `TransferModal`| Critical | M        |                  |
| F3  | Pin `@aegis/sdk` dep + codegen types + replace mocked calls                 | High     | L        |                  |
| F4  | Replace `parseFloat` with BigInt/stroops-aware amount parsing               | High     | S        |                  |
| F5  | Add network guard + disambiguation banner                                   | High     | S        |                  |
| F6  | Add Vitest + RTL unit/component tests with coverage gate                     | High     | M        | gates F7, F8       |
| F7  | Define real `Asset` interface + swap mock portfolio data for SDK source     | High     | M        |                  |
| F8  | Add Playwright e2e covering connect → KYC → transfer → mint                 | Medium   | M        |                  |
| F9  | Add wallet auto-reconnect + persisted (non-key) session hint                | Medium   | S        |                  |
| F10 | Replace `alert()` with toast notifications and add confirmation modals      | Medium   | S        |                  |
| F11 | Add amount input + validation to `AdminPanel` mint flow                     | Medium   | S        |                  |
| F12 | Implement real `whitelist` admin action (not `alert`)                      | Medium   | M        |                  |
| F13 | Add root ErrorBoundary + telemetry sink (Sentry/Datadog)                    | Medium   | M        |                  |
| F14 | Gate Freighter calls behind a client-only mount check (SSR safety)          | Medium   | S        |                  |
| F15 | Commit baseline `.gitignore` (incl. `next-env.d.ts`) and `package-lock.json`| Medium   | S        |                  |
| F16 | Tighten `truncateAddress` types + add edge tests                           | Low      | S        |                  |
| F17 | Add skeleton / empty states to portfolio                                    | Low      | S        |                  |
| F18 | Configure Prettier + Husky + lint-staged                                   | Low      | S        |                  |
| F19 | Promote `useWallet.network` to a strongly-typed `StellarNetwork` enum       | Low      | S        |                  |
| F20 | Document SDK authoring/upgrade checklist in `docs/`                         | Low      | S        |                  |

> Estimations: S = ≤ half a day · M = 1–2 days · L = ≥ 3 days.
>
> **Execution order (recommended):** F0 first (force-multiplier). Then F1→F2
> in parallel with F3→F5. F6 (test infrastructure) before F7→F8 (which
> depend on it). F9–F20 are runner-ups that should ride along on the
> relevant feature PRs.

## 12. Conclusions

The dashboard is a credible visual prototype. It is not a credible trading
interface. The Critical findings (¶4.1, ¶4.2) and the High findings (¶4.3,
¶4.4, ¶4.5, ¶5, ¶6.1) together are sufficient to block any release that
moves value. The team's MVP narrative ("securely on Stellar", "institutional
grade") is currently aspirational; closing the findings in §11 in the
suggested order is what converts that narrative into evidence.

The single most leveraged PR is **F0 (CI gate)** — once lint, typecheck,
and tests block merge into `main`, F1–F7 are forced to ship under that
gate together, and the rest of the roadmap becomes routine.

