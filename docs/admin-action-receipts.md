# Admin Action Receipts

Issue #179 adds a consistent receipt view for privileged dashboard actions.
After an action resolves, admins see its status, operation, target, transaction
hash, explorer link (when available), and a context-specific next action.

## Architecture

The feature lives in `src/features/admin/receipts/`:

| File | Purpose |
| --- | --- |
| `types.ts` | Typed admin operations and normalized receipt model |
| `mapAdminActionReceipt.ts` | Maps provider/local outcomes into receipt data |
| `AdminActionReceiptView.tsx` | Admin view composed from shared `TransactionReceipt` |
| `fixtures.ts` | Major operations and success/failure/pending/unknown states |

The mapper reuses:

- `mapToTransactionResult` for SDK/RPC status normalization
- `getExplorerUrl` for trusted Stellar Expert links
- `TransactionReceipt` for consistent status, hash, and detail rendering

## Represented operations

| Operation | Current integration | Chain evidence |
| --- | --- | --- |
| Whitelist add / revoke | `WhitelistActionModal` | Provider hash and explorer link when returned |
| Mint | `MintWorkflow` and legacy admin mint | Provider hash and explorer link when returned |
| Asset registration | `AssetCreationWizard` | Local issuance request only; no hash |
| Role change | Typed fixture / expected view | No dashboard SDK action is wired yet |
| Bulk compliance update | `ComplianceUpdateModal` | Local success today; explorer link only when a future provider returns a hash |

`AdminActionOperation` intentionally distinguishes whitelist add from revoke even
though both use the shared `whitelist` transaction presentation label.

## Receipt states

The view supports the shared transaction statuses:

- `success` — action confirmed or local request accepted
- `failure` — provider rejected the action or returned an error
- `pending` — submitted but not confirmed
- `unknown` — the outcome cannot be confirmed

Pending and unknown receipts tell the admin to verify network state before
retrying. This reduces duplicate privileged actions when the original submission
may still complete.

## Explorer links

Explorer links are shown only when both are true:

1. The provider returned a transaction hash.
2. The wallet network maps to a supported Stellar Expert network (`TESTNET` or
   public/mainnet aliases).

A hash on an unsupported network remains visible, but the link is omitted and a
limitation note explains why. Missing hashes are never fabricated.

## Next actions

Each operation maps to a useful follow-up:

- Whitelist add/revoke → **Back to whitelist**
- Mint → **Mint another**
- Asset registration → **Create another**
- Role change → **Review role assignments**

Failure uses **Review action**. Pending/unknown uses **Check transaction status**.
The caller owns navigation/reset behavior; the mapper owns labels and guidance.

## Limitations

- Asset creation currently creates a local `IssuanceRequest` and does not submit
  an on-chain registration transaction. Its receipt therefore has no hash or
  explorer link.
- Role-change provider/UI support does not exist yet. Fixtures document the
  expected receipt contract so future SDK integration does not require a new
  view.
- Mock provider hashes are synthetic and intended only for dashboard testing.
- An absent hash does not prove an action failed. Admins should check the list or
  transaction history before retrying.

## Tests and fixtures

- `mapAdminActionReceipt.test.ts` covers status mapping, explorer behavior,
  limitations, major operations, and receipt states.
- `AdminActionReceiptView.test.tsx` covers status/operation/target/hash display,
  explorer links, next actions, and local-action limitations.
- Existing whitelist, mint, admin, and asset-creation flow tests exercise the
  integrated view.
