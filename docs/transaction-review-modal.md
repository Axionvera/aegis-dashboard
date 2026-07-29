# Transaction Review Modal

Pre-signature confirmation for sensitive dashboard actions (Issue #177).

The dashboard must not send compliance, minting, transfer, or admin transactions
straight to the wallet. Users first see a consistent operation summary with
target, asset, network, expected result, and risk notes.

## Components

| File | Role |
| --- | --- |
| `src/components/transactions/TransactionReviewModal.tsx` | Dialog shell for standalone review-before-sign flows |
| `src/components/transactions/TransactionReview.tsx` | Shared review body (also used inline inside existing modals) |
| `src/components/transactions/operationSummary.ts` | Mapper that builds review details per operation type |
| `src/components/transactions/fixtures.ts` | Fixtures covering transfer, mint, whitelist, and compliance update |

## Review behaviour

1. The user completes the form / selects an action.
2. Validation and any compliance pre-checks run first.
3. The flow enters `review` and shows the operation summary.
4. Nothing is submitted until **Confirm & Sign**.
5. Cancel / close returns to the previous step without signing.

Inline flows such as `TransferModal` and `MintWorkflow` keep their own shell and
render `TransactionReview` inside it. Standalone flows such as whitelist add /
remove and bulk compliance update open `TransactionReviewModal`.

## Operation summary mapper

Call the mapper instead of hand-building `TransactionDetails`:

```ts
import {
  buildTransferSummary,
  buildMintSummary,
  buildWhitelistSummary,
  buildComplianceUpdateSummary,
} from '@/components/transactions/operationSummary';
```

Each summary includes:

- **Operation type** — transfer, mint, whitelist, or compliance update
- **Target** — recipient / subject address
- **Asset** — when the action is asset-scoped
- **Network** — wallet-reported network, or `Unknown`
- **Expected result** — protocol-level outcome if the signature is accepted
- **Risk notes** — caveats shown before signing

Risk notes stay protocol-level. Compliance-facing copy continues to use
`COMPLIANCE_DISCLAIMER` / `withDisclaimer` from `src/lib/complianceReview.ts`.

## SDK integration

The review modal does not call the SDK itself. Callers:

1. Build details with the mapper.
2. Show the review UI.
3. On confirm, call `useAegis` / provider methods (`transfer`, `mint`,
   `addToWhitelist`, `removeFromWhitelist`, etc.) and pass `onPhase` so
   progress / receipt screens stay in sync.

## Fixtures and tests

- `transactionReviewFixtures` covers all four major operation types.
- `operationSummary.test.ts` asserts target, network, expected result, and risk notes.
- `TransactionReviewModal.test.tsx` covers dialog rendering and confirm / cancel.
- Existing flow tests (`TransferModal`, `MintWorkflow`, `ComplianceUpdateModal`)
  still exercise review-before-sign end to end.

## Related docs

- [transaction-components.md](transaction-components.md) — shared review / progress / receipt contract
- [compliance-safe-wording.md](compliance-safe-wording.md) — disclaimer rules
- [admin-whitelist-management.md](admin-whitelist-management.md) — whitelist review modal usage
- [rwa-asset-minting-workflow.md](rwa-asset-minting-workflow.md) — mint review step
