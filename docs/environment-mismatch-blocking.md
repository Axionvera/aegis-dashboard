# Environment Mismatch Blocking Screen

Issue: [#36](https://github.com/Axionvera/aegis-dashboard/issues/36)

When the connected wallet is on a different Stellar network than the one the
dashboard targets (testnet vs mainnet), most SDK calls will fail and any
transaction the user attempts will not reach its intended destination. This
module detects the mismatch early at the app-shell level and shows a dedicated
blocking screen before the user can interact with any page.

> **Important:** This is a protocol-level network check. It is not legal,
> regulatory, or financial advice. The screen makes no determination about the
> user's wallet, jurisdiction, or eligibility.

---

## Data Model

The core logic lives in `src/lib/environment.ts`:

| Export | Type | Purpose |
|---|---|---|
| `EnvironmentMismatchState` | `'match' \| 'mismatch' \| 'no_wallet' \| 'checking'` | The four possible states of the environment check. |
| `EnvironmentMismatchResult` | interface | `state`, `title`, `message`, `targetNetwork`, `walletNetwork?` |
| `getTargetNetwork()` | `() => string` | Reads `NEXT_PUBLIC_NETWORK_PASSPHRASE`; defaults to Stellar testnet passphrase. |
| `resolvePassphrase(walletNetwork)` | `(unknown) => string \| null` | Normalises Freighter's `getNetwork()` output to a canonical passphrase. |
| `formatNetworkLabel(passphrase)` | `(string) => string` | Maps a passphrase to a human-readable label (e.g. `"Stellar Testnet (TESTNET)"`). |
| `evaluateEnvironmentMismatch(walletNetwork, isWalletConnected)` | `(unknown, boolean) => EnvironmentMismatchResult` | Main evaluation function. |

### EnvironmentMismatchResult fields

| Field | Always present | Description |
|---|---|---|
| `state` | Yes | Current state of the check. |
| `title` | Yes | Headline (empty for `match`). |
| `message` | Yes | Plain-language explanation. |
| `targetNetwork` | Yes | Human-readable label of the dashboard's target network. |
| `walletNetwork` | Only on `match`/`mismatch` | Human-readable label of the wallet's current network. |

---

## Behaviour

The check runs in `src/pages/_app.tsx` inside an `EnvironmentGuard` component
that wraps all page content:

1. On mount, `WalletAutoReconnect` attempts a silent reconnect to a previously
   authorised Freighter session.
2. After a short debounce (~100 ms), `EnvironmentGuard` evaluates the wallet
   state using `evaluateEnvironmentMismatch`.
3. If the wallet is connected and on a different network than the dashboard
   target, the guard renders `<EnvironmentMismatchScreen>` instead of the
   requested page.
4. When the user switches their wallet network (or disconnects), the Zustand
   store update triggers a re-evaluation. If the mismatch is resolved, the
   page content appears automatically — no refresh needed.

### States

| State | What it means | Screen shown |
|---|---|---|
| `match` | Wallet network matches the dashboard target. | Normal page content. |
| `mismatch` | Wallet is connected but on the wrong network. | `EnvironmentMismatchScreen` — full-page blocking screen with target and current network displayed. |
| `no_wallet` | No wallet is connected. | Normal page content — the `RouteGuard` handles wallet-required pages. |
| `checking` | Wallet is connected but the network info is not yet available. | Normal page content — the guard re-evaluates once the network resolves. |

### Mock mode

When `NEXT_PUBLIC_MOCK_MODE=true` is set, the environment check is skipped
entirely. Mock mode uses a synthetic `LOCAL_MOCK` network that would never
match a real passphrase, and the `MockModeBanner` already warns developers.
The check only runs in live (non-mock) mode.

---

## Edge Cases and Failure States

| Case | Behaviour | Rationale |
|---|---|---|
| Wallet not connected | `state: 'no_wallet'` — passes through; `RouteGuard` handles wallet-required pages. | Environment mismatch only matters when a wallet is connected. |
| Wallet connected, network unknown (null) | `state: 'checking'` — passes through; re-evaluates when network resolves. | Avoids a false block during the brief window after connection. |
| Mock mode active | Check skipped entirely. | Mock network is synthetic; the `MockModeBanner` already surfaces the warning. |
| User disconnects while blocked | `address` becomes null → re-evaluation → `blocked: false` → page content returns. | The `RouteGuard` then shows "Connect wallet" for protected pages. |
| User switches network while blocked | `network` changes → re-evaluation → if match, `blocked: false` → page content returns. | No manual refresh needed. |
| Custom network passphrase (not in known map) | Displayed verbatim as the label. | Works with any Stellar network passphrase. |
| Empty `NEXT_PUBLIC_NETWORK_PASSPHRASE` | Defaults to Stellar testnet passphrase. | Safe local-development default. |
| Freighter returns a string instead of an object | Handled by `resolvePassphrase` which accepts both shapes. | Backward-compatible with older or differently-configured Freighter versions. |
| Wallet on the same network as target | No blocking screen; no visible indicator. | The check is silent for the common happy path. |

---

## Security and Compliance Assumptions

- **Protocol-level only.** The blocking screen communicates a network mismatch
  at the protocol level. It never implies legal, regulatory, or financial
  authority. The disclaimer at the bottom of the screen makes this explicit.
- **No determination about the user.** The screen does not assess KYC status,
  jurisdiction, eligibility, or compliance standing. It only compares two
  network passphrases.
- **Mock mode never checked in production.** `assertMockModeSafe()` in
  `src/config/mockMode.ts` throws if mock mode is active outside
  `NODE_ENV=development`. The environment guard additionally skips the check
  when mock mode is enabled, avoiding false blocks in development.
- **Fail-closed on doubt.** If the wallet is connected but the network cannot
  be determined, the guard passes through (deferring to `RouteGuard`) rather
  than showing a potentially misleading blocking screen.
- **No PII.** No addresses, keys, or secrets are rendered on the blocking
  screen. Only network passphrases and their human-readable labels appear.
- **The disclaimer is not removable.** The `EnvironmentMismatchScreen`
  component always renders the protocol-level disclaimer. Any custom
  implementation that reuses `evaluateEnvironmentMismatch` must attach a
  similar disclaimer.

---

## Integration Points

| File | Role |
|---|---|
| `src/pages/_app.tsx` | `EnvironmentGuard` component — evaluates wallet state and conditionally renders `EnvironmentMismatchScreen`. |
| `src/lib/environment.ts` | Pure logic and types. Imported by the guard. |
| `src/components/EnvironmentMismatchScreen.tsx` | Full-page blocking screen UI. Imported by the guard. |
| `src/hooks/useWallet.ts` | Source of `network` and `address` state (Zustand store). |
| `src/config/mockMode.ts` | `isMockModeEnabled()` — guard skips check when mock mode is active. |

---

## Tests, Fixtures and Reviewer Checklist

### Tests

| File | What it covers |
|---|---|
| `src/lib/environment.test.ts` | All four states of `evaluateEnvironmentMismatch`, passphrase resolution, label formatting, target network fallback, custom passphrases, edge cases. |
| `src/components/EnvironmentMismatchScreen.test.tsx` | Title rendering, message rendering, network labels, disconnect button, disclaimer. |

### Fixtures

| File | Contents |
|---|---|
| `src/lib/__fixtures__/environment.ts` | `ENVIRONMENT_MISMATCH_FIXTURES` — 7 fixture entries covering match (object + string), mismatch (object + string), no_wallet, checking, and empty-object edge case. |

### Reviewer Checklist

Use alongside the general [Reviewer Checklist](reviewer-checklist.md) when a PR
adds or changes environment mismatch behaviour.

- [ ] The blocking screen renders with a clear title, message, and both network
      labels when a mismatch is detected.
- [ ] The protocol-level disclaimer is present and visible on the blocking screen.
- [ ] The check is skipped when mock mode is active (no false blocks in dev).
- [ ] Disconnecting the wallet while blocked dismisses the screen.
- [ ] Switching the wallet network to the correct one dismisses the screen.
- [ ] All fixture states in `src/lib/__fixtures__/environment.ts` have
      corresponding test cases.
- [ ] No copy on the blocking screen implies legal, financial, or regulatory
      authority.
- [ ] The guard does not introduce noticeable delay for users on the correct
      network (happy path is fast).

---

## Related

- [Route Access](route-access.md) — Route-level role and connection guard.
- [Mock Mode](mock-mode.md) — Local development without a live RPC endpoint.
- [Compliance-Safe Wording](compliance-safe-wording.md) — Canonical disclaimer
  text and usage guidance.
- [SDK Error Recovery](sdk-error-recovery.md) — Reactive network mismatch
  handling (when an SDK call fails due to wrong network).
- [Investor Transfer Eligibility](investor-transfer-eligibility.md) —
  Network-aware transfer blocking in the eligibility engine.
- [Diagnostics](diagnostics.md) — Environment troubleshooting page.
