# Wallet Network Guard

Issue: [#180](https://github.com/Axionvera/aegis-dashboard/issues/180)

Freighter lets a user switch networks at any moment, including while a review
modal is open. A signature produced on the wrong network either fails or lands
on a ledger the operator did not intend. This module compares the wallet's
network against the dashboard's target network **per action**, immediately
before the action can be started or signed.

> **Important:** This is a protocol-level network check. It is not legal,
> regulatory, or financial advice, and it makes no determination about the
> user's wallet, jurisdiction, or eligibility.

---

## How this differs from the environment mismatch screen

[Environment Mismatch Blocking](environment-mismatch-blocking.md) (#36) blocks
whole **pages** at the app shell. The network guard blocks individual
**actions**. They compare the same two values and share the passphrase
resolution helpers in `src/lib/environment.ts`, so they can never disagree.

| | Environment mismatch screen (#36) | Wallet network guard (#180) |
|---|---|---|
| Scope | Whole page | One action |
| Rendered by | `EnvironmentGuard` in `_app.tsx` | The flow that owns the action |
| Outcome | Replaces page content | Disables the confirm button, shows an inline notice |
| Policy | Always blocks | Blocks or warns, per action |

The guard is not redundant with the page-level screen. The screen can be
bypassed in mock mode, only re-evaluates against stored state, and says nothing
about which action is at risk. The guard also stays correct when the user
switches networks *after* opening a review modal.

---

## Live network detection

`useWallet` captures the network once at connect time. Freighter emits no
"network changed" event, so without help that value goes stale the moment the
user switches, and every check downstream would compare against the old network.

Two pieces fix that:

| Export | File | Purpose |
|---|---|---|
| `toStoredNetwork(walletNetwork)` | `src/lib/environment.ts` | Collapses Freighter's object/string payload into a stable string (short name preferred). |
| `refreshNetwork()` | `src/hooks/useWallet.ts` | Re-reads `getNetwork()` without prompting the user and updates the store only when the resolved passphrase changed. |
| `useWalletNetworkWatcher(pollMs?)` | `src/features/wallet/useNetworkGuard.ts` | Calls `refreshNetwork` on mount, every `pollMs` (default 5000), on window focus, and when the tab becomes visible. |

The watcher is mounted once in `src/pages/_app.tsx`. Polling pauses while the
tab is hidden and runs immediately on refocus, so a user returning from the
Freighter popup sees the new network without a manual refresh. Because the
watcher writes to the shared store, the app-shell environment screen benefits
from the same live detection.

Freighter returns a fresh object on every `getNetwork()` call, so the refresh
compares by resolved passphrase rather than by reference. Without that, every
poll would rewrite the store and re-render the app even when the user had not
switched. Connect, auto-reconnect, and refresh all run the payload through
`toStoredNetwork` first — the store holds a string, never the raw Freighter
object, so callers that call `.trim()` (review rows, explorer links) stay safe.

A failed read leaves the previous value in place rather than clearing it. A
transient Freighter failure must not wipe a known-good network and falsely
unlock a signing action that was correctly blocked a moment earlier.

---

## Policy: block versus warn

Each guarded action declares a sensitivity in
`GUARDED_ACTIONS` (`src/features/wallet/networkGuard.ts`):

| Sensitivity | Meaning | On mismatch |
|---|---|---|
| `signing` | Asks the wallet for a signature and writes to chain. | **Block** |
| `local` | Recorded in the dashboard only; never reaches the wallet. | **Warn** |

| Action | Sensitivity | Where it is enforced |
|---|---|---|
| `transfer` | `signing` | `src/features/investor/components/TransferModal.tsx` |
| `mint` | `signing` | `src/features/minting/components/MintWorkflow.tsx`, legacy path in `src/features/admin/components/AdminPanel.tsx` |
| `whitelist-add` | `signing` | `src/features/compliance/components/WhitelistActionModal.tsx` |
| `whitelist-remove` | `signing` | `src/features/compliance/components/WhitelistActionModal.tsx` |
| `compliance-update` | `local` | `src/features/admin/components/ComplianceUpdateModal.tsx` |
| `asset-registration` | `local` | `src/features/asset-creation/components/AssetCreationWizard.tsx` |

### Decision matrix

| Status | Meaning | `signing` | `local` |
|---|---|---|---|
| `match` | Wallet network equals the target. | allow | allow |
| `mismatch` | Wallet is on a different network. | block | warn |
| `unknown` | Wallet connected, network unreadable. | block | allow |
| `disconnected` | No wallet connected. | block | allow |
| `mock` | Mock mode is active. | allow | allow |

Signing actions **fail closed**: an unresolved network is treated exactly like a
wrong one, because a signature sent to an unverified network cannot be recalled.
Local actions never block — nothing reaches the wallet, so stopping the operator
would be a false obstacle — but a mismatch is still surfaced, since the record
is attributed to a network label.

Mock mode is exempt. The synthetic `LOCAL_MOCK` network would never match a real
passphrase, and `MockModeBanner` already warns developers. `assertMockModeSafe()`
prevents mock mode from being enabled outside development.

---

## Network assumptions

- **The dashboard targets exactly one network**, read from
  `NEXT_PUBLIC_NETWORK_PASSPHRASE`. When it is unset, `getTargetNetwork()`
  falls back to the Stellar testnet passphrase. There is no multi-network mode.
- **The passphrase is the identity of a network.** Short names (`TESTNET`,
  `PUBLIC`) are resolved to their full passphrase by `resolvePassphrase`, which
  also accepts both the object and the bare-string shapes Freighter has
  returned across versions.
- **An unrecognised passphrase is a valid network**, not an error. It is
  displayed verbatim and compared by exact string equality, so custom and
  standalone networks work without a code change.
- **The dashboard cannot switch the wallet's network.** Freighter owns that
  selector, so the guard can only explain the mismatch and tell the user what to
  change.
- **The guard is a UI safety net, not an authorisation boundary.** It reduces
  wrong-network mistakes; it does not replace on-chain checks, and a determined
  caller can always reach the contract directly.

---

## Usage

```tsx
import { NetworkGuardNotice, useNetworkGuard } from '@/features/wallet';

const networkGuard = useNetworkGuard('transfer');

// 1. Stop the action from starting.
<button onClick={handleReview} disabled={networkGuard.isBlocked}>Review</button>

// 2. Explain why. Renders nothing when the decision is `allow`.
<NetworkGuardNotice guard={networkGuard} />

// 3. Re-check inside the handler, so a mid-flow switch cannot slip through.
const handleConfirm = async () => {
  if (networkGuard.isBlocked) return;
  // …
};
```

Flows built on the shared review components pass the guard straight through:

```tsx
<TransactionReview
  details={details}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  canConfirm={!networkGuard.isBlocked}
  notice={<NetworkGuardNotice guard={networkGuard} />}
/>
```

`canConfirm` disables only the confirm button, leaving Cancel available — a
blocked user must always be able to walk away. `TransactionReviewModal` accepts
and forwards both props.

Every guarded surface checks in three places: the entry button is disabled, the
handler re-checks before doing work, and the review screen re-checks before the
signature. The last one matters most, because the user can switch networks
between opening the review screen and pressing Confirm.

---

## User guidance

Each non-`allow` result carries three strings, so the notice always answers
"what happened", "why", and "what now":

| Field | Content |
|---|---|
| `title` | What the guard found, e.g. `Wrong wallet network`. |
| `message` | What it means for this action, naming it explicitly, and stating that nothing was submitted when blocked. |
| `guidance` | The single next step, e.g. `Switch Freighter to Stellar Testnet (TESTNET), then reopen this action.` |

`NetworkGuardNotice` renders both network labels, a **Recheck network** button
that calls `refreshNetwork` for users who do not want to wait for the next poll,
and `NETWORK_GUARD_DISCLAIMER`. Blocked results use red styling and a shield
icon; warnings use amber. The notice carries `role="alert"` and
`aria-live="polite"`.

---

## Edge Cases and Failure States

| Case | Behaviour | Rationale |
|---|---|---|
| User switches network while a review modal is open | Next poll or refocus updates the store; the confirm button disables and the notice appears. | The signature must be judged against the network in force now, not at connect time. |
| Freighter locked or `getNetwork()` throws | Previous value retained; signing already blocks on `unknown`. | Guessing a network is more dangerous than admitting the read failed. |
| Wallet connected, network unreadable | `unknown` → signing blocked, local allowed. | Fail closed only where a signature is at stake. |
| No wallet connected | `disconnected` → signing blocked. | Nothing can be signed anyway; the copy points at connecting rather than switching. |
| Mock mode active | `mock` → always allowed. | No real network is involved; `MockModeBanner` covers the warning. |
| Custom or standalone passphrase | Compared exactly, displayed verbatim. | Works with any Stellar network without a code change. |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` unset | Defaults to testnet. | Safe local-development default, matching #36. |
| Tab hidden | Polling pauses, resumes with an immediate read on return. | Avoids waking Freighter for a background tab. |
| Local action on the wrong network | Warns, still submits. | Nothing reaches the wallet, so blocking would be a false obstacle. |
| Guard blocks after a failure already occurred | The reactive path in [SDK Error Recovery](sdk-error-recovery.md) still handles `network_mismatch`. | The guard is preventive; recovery stays as the backstop. |

---

## Tests and Fixtures

| File | What it covers |
|---|---|
| `src/features/wallet/networkGuard.test.ts` | Every fixture, block-versus-warn per sensitivity, fail-closed on `unknown`, disconnected copy, mock bypass, short network names, custom passphrases, empty copy when allowed. |
| `src/features/wallet/useNetworkGuard.test.tsx` | Guard re-evaluation on store change, polling only while connected, detecting a post-connect switch, refresh on focus, cleanup on unmount, retaining the last network when the read fails. |
| `src/features/wallet/components/NetworkGuardNotice.test.tsx` | Renders nothing when allowed, block versus warn copy, both network labels, disclaimer, recheck button. |
| `src/features/compliance/components/WhitelistActionModal.test.tsx` | A wrong-network signature is refused and Cancel stays usable. |

`src/features/wallet/fixtures.ts` exports `NETWORK_GUARD_FIXTURES`, covering
every status/decision pair for both sensitivities, including the object and
bare-string network shapes.

### Reviewer Checklist

Use alongside the general [Reviewer Checklist](reviewer-checklist.md).

- [ ] Every new signing action declares a policy in `GUARDED_ACTIONS`.
- [ ] The entry button, the handler, and the review screen all consult the guard.
- [ ] `canConfirm` is used rather than `isSubmitting` to block on network state,
      so Cancel stays available.
- [ ] Blocked copy states that nothing was submitted.
- [ ] Guidance names the target network and the concrete next step.
- [ ] The protocol-level disclaimer is present on any custom guard surface.
- [ ] Mock mode is not blocked.
- [ ] Component tests that render a signing flow set a connected wallet on the
      target network, otherwise the guard blocks them.

---

## Related

- [Environment Mismatch Blocking](environment-mismatch-blocking.md) — Page-level
  network blocking (#36).
- [SDK Error Recovery](sdk-error-recovery.md) — Reactive handling once a call
  has already failed with `network_mismatch`.
- [Transaction Review Modal](transaction-review-modal.md) — The review surface
  the guard renders into.
- [Mock Mode](mock-mode.md) — Why mock mode is exempt.
- [Compliance-Safe Wording](compliance-safe-wording.md) — Disclaimer guidance.
