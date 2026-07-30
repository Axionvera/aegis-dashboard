# Transaction Review & Receipt Components

Shared UI for every signed transaction in the dashboard — transfers, minting,
compliance updates and admin actions. The goal is that no flow invents its own
review screen, spinner or success message.

All of it lives in `src/components/transactions/`.

| File | What it is |
| --- | --- |
| `types.ts` | Shared vocabulary: `TransactionState`, `TransactionAction`, `TransactionDetails`, `TransactionResult` |
| `TransactionReview.tsx` | Pre-signature confirmation screen (operation rows, expected result, risk notes) |
| `TransactionReviewModal.tsx` | Dialog shell for standalone review-before-sign flows |
| `operationSummary.ts` | Mapper that builds consistent review details per sensitive operation |
| `TransactionProgress.tsx` | In-flight indicator (`signing` / `pending`) |
| `TransactionReceipt.tsx` | Terminal screen for all four outcomes |
| `statusMapper.ts` | `mapToTransactionResult(outcome)` — normalises any RPC response or thrown error |
| `explorerLink.ts` | `getExplorerUrl(txHash, network)` — stellar.expert link |
| `fixtures.ts` | Sample details/results for previewing each state |

See also [transaction-review-modal.md](transaction-review-modal.md) for Issue #177
behaviour, risk-note rules, and mapper usage.

## The flow

Every flow follows the same four steps, driven by a single `TransactionState`:

```
idle ──▶ review ──▶ signing ──▶ pending ──▶ success | failure | unknown
 form    Review      Progress    Progress          Receipt
```

The components are layout-agnostic: `TransferModal` renders them inside a modal,
`AdminPanel` renders them inline in a card. Neither owns any status logic.

## Components

### `TransactionReview`

```tsx
<TransactionReview
  details={details}       // TransactionDetails from operationSummary
  onConfirm={handleConfirm}
  onCancel={() => setState('idle')}
  isSubmitting={false}    // optional — disables both buttons
  canConfirm={true}       // optional — disables Confirm only
  notice={<NetworkGuardNotice guard={networkGuard} />} // optional
/>
```

Renders the action label, title, optional description and a `label / value` table
built from `details.rows`. Set `mono: true` on a row for addresses and hashes so
they render in a monospace font and wrap instead of overflowing.

When present, `details.expectedResult` and `details.riskNotes` are shown above
the wallet-signature reminder so every sensitive action surfaces the same
pre-sign safety information. Prefer `buildTransferSummary`, `buildMintSummary`,
`buildWhitelistSummary`, or `buildComplianceUpdateSummary` over hand-built rows.

`canConfirm` and `notice` exist for conditions the user can still walk away
from — a wrong wallet network, for example. Unlike `isSubmitting`, `canConfirm`
leaves Cancel enabled, and `notice` renders above the buttons so the reason is
visible next to the disabled action. Both are forwarded by
`TransactionReviewModal`. See [wallet-network-guard.md](wallet-network-guard.md).

### `TransactionReviewModal`

```tsx
<TransactionReviewModal
  details={details}
  onConfirm={handleConfirm}
  onCancel={onClose}
  canConfirm={!networkGuard.isBlocked}                  // optional
  notice={<NetworkGuardNotice guard={networkGuard} />}  // optional
  footer={COMPLIANCE_DISCLAIMER}                        // optional
/>
```

Use this for standalone confirmation dialogs (whitelist, bulk compliance). Flows
that already own a modal shell, such as transfers, should keep rendering
`TransactionReview` inline.

### `TransactionProgress`

```tsx
<TransactionProgress state="signing" /> // or "pending"
```

- `signing` — waiting for the wallet signature. Nothing has been submitted yet.
- `pending` — submitted, waiting for network confirmation.

The phase is passed in by the caller, so it always reflects what is actually
happening. `useAegis` reports it through the optional `onPhase` callback:

```ts
const outcome = await transfer(recipient, amount, setState);
```

### `TransactionReceipt`

```tsx
<TransactionReceipt
  result={result}         // TransactionResult
  details={details}       // same object used for the review
  onClose={reset}
  explorerUrl={getExplorerUrl(result.txHash, network)}
  nextAction={{           // optional — used by admin receipts
    label: 'Mint another',
    description: 'Review the confirmed amount before starting another mint.',
    onClick: reset,
  }}
/>
```

Handles all four outcomes with its own icon, colour and badge:

| Status | Meaning |
| --- | --- |
| `success` | Confirmed on-chain |
| `failure` | Rejected, reverted, or the call threw |
| `pending` | Submitted, not confirmed yet |
| `unknown` | We could not determine the outcome — the copy tells the user to check the explorer **before** retrying, since the transaction may still go through |

The transaction hash row and the explorer link are only rendered when available,
so a failure that never reached the network shows neither.
`nextAction` and `limitation` are optional. The admin receipt feature uses them
for operation-specific follow-up guidance and to explain missing chain evidence.
See [admin-action-receipts.md](admin-action-receipts.md).

## Status mapping

`mapToTransactionResult(outcome)` takes anything a transaction call can produce
and returns a `TransactionResult`:

| Input | Result |
| --- | --- |
| `Error` (or a rejected promise value) | `failure`, with the error message as detail |
| `{ status, hash \| txHash, error }` | mapped by the status table below |
| A bare status string, e.g. `'SUCCESS'` | mapped by the status table below |
| `null`, `undefined`, unrecognised status | `unknown` |

Status table (case-insensitive):

- **success** — `success`, `confirmed`, `completed`, `applied`
- **failure** — `failed`, `failure`, `error`, `rejected`, `duplicate`, `malformed`
- **pending** — `pending`, `submitted`, `not_found`, `try_again_later`

An `error` field always wins: a response carrying an error is a failure even if
its status looks successful.

Typical usage — the call's return value goes straight into the mapper, so the
flow never decides a status itself:

```ts
try {
  setResult(mapToTransactionResult(await transfer(recipient, amount, setState)));
} catch (err) {
  setResult(mapToTransactionResult(err));
}
```

## Testing every state

`useAegis` is still mocked, and a mock that always succeeds makes the failure,
pending and unknown receipts unverifiable. So the **amount drives the outcome**
until the SDK lands:

| Amount | Receipt |
| --- | --- |
| `0.01` | `failure` — "Recipient account is not authorised to hold this asset." |
| `0.02` | `pending` |
| `0.03` | `unknown` (the mock returns an unrecognised status) |
| anything else | `success` |

Run a transfer from `/portfolio` with each amount to walk all four states. The
rule lives in `mockOutcome` in `src/lib/aegis/client.ts` and goes away with the
mock — the real client returns the RPC status and the mapper handles the rest.

Note that `/admin` mints a fixed `1000`, so that flow always renders `success`.

## Explorer links

```ts
getExplorerUrl(txHash, network); // https://stellar.expert/explorer/testnet/tx/<hash>
```

Returns `null` — never a broken link — when there is no hash yet or the network
is not one stellar.expert serves (`PUBLIC`/`MAINNET` and `TESTNET` are mapped).
`TransactionReceipt` hides the link when it receives `null`, so callers can pass
the result through directly.

## Fixtures

`fixtures.ts` exports ready-made details and results for every state, for
rendering a receipt without running a flow at all:

```tsx
import { transferDetailsFixture, unknownResultFixture } from '@/components/transactions/fixtures';

<TransactionReceipt
  result={unknownResultFixture}
  details={transferDetailsFixture}
  onClose={() => {}}
/>
```

### Contributor fixture gallery

Use the gallery component at `src/components/transactions/TransactionFixtureGallery.tsx`
for a single-page preview of review, progress, and receipt states. It is meant for
UI review and contributor QA, not as a substitute for SDK or contract-level
validation. The gallery lives on the `/transactions` page and should be updated
whenever new transaction states or messaging are introduced.

Keep any compliance-facing copy conservative and avoid presenting protocol-level
status as legal or financial advice.

## Flows using these components

- **`src/features/investor/components/TransferModal.tsx`** — the KYC whitelist check runs first,
  then `Review Transfer` opens `TransactionReview` via `buildTransferSummary`.
- **`src/features/minting/components/MintWorkflow.tsx`** — guided admin mint (Issue #6):
  asset selector, amount/recipient validation, compliance pre-check, then
  `TransactionReview` via `buildMintSummary` → progress → receipt / SDK recovery.
- **`src/features/compliance/components/WhitelistActionModal.tsx`** — opens
  `TransactionReviewModal` with `buildWhitelistSummary` before add/remove.
- **`src/features/admin/components/ComplianceUpdateModal.tsx`** — opens
  `TransactionReviewModal` with `buildComplianceUpdateSummary` before bulk actions.
- **`src/features/admin/components/AdminPanel.tsx`** — hosts the mint workflow
  (or the legacy fixed-amount panel when `newMintFlow` is off).

`Whitelist User` in the legacy admin panel still uses an inline confirmation: it does not go
through `useAegis` and has no contract call or hash behind it yet. Prefer
`WhitelistManager` / `WhitelistActionModal` for signed whitelist changes.
