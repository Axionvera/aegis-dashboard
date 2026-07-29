# RWA Asset Creation Wizard

Closes #29. Documents the Issuer Console wizard for submitting a new RWA
asset issuance request: asset details entry, review, and submission into
the compliance-review queue.

## Scope

This document covers **creating a new issuance request**, not minting
supply. The two are deliberately distinct surfaces:

| Concern | Document |
|---|---|
| Minting existing/approved supply to a recipient | [rwa-asset-minting-workflow.md](rwa-asset-minting-workflow.md) |
| Post-mint lifecycle states | [asset-lifecycle-status.md](asset-lifecycle-status.md) |
| Compliance-safe copy | [compliance-safe-wording.md](compliance-safe-wording.md) |
| Route access (`/issuer`) | [route-access.md](route-access.md) |

A request created here starts in `pending` status in the existing Issuer
Console table (`draft → pending → approved → minted → rejected`, see
`src/fixtures/issuer.ts`). It only becomes eligible for the minting workflow
once a compliance reviewer moves it to `approved` — that review/approval
step is not implemented by this issue and is out of scope here.

## Entry point

- Route: `/issuer` (issuer/admin roles — see [route-access.md](route-access.md))
- Page: `src/pages/issuer.tsx` — "New asset request" button opens the wizard
  in a modal
- Component: `src/features/asset-creation/components/AssetCreationWizard.tsx`

## Flow

```
form (asset name, ticker, asset class, initial supply, jurisdiction)
  → validateAssetCreationRequest
  → review (summary of entered details)
  → submit → new IssuanceRequest{status: 'pending'} prepended to the table
  → success screen (create another / done)
```

1. Issuer enters asset name, ticker, asset class, initial requested supply,
   and jurisdiction.
2. On **Review request**, `validateAssetCreationRequest` runs
   (`src/lib/assetCreationRequest.ts`), checking the ticker against every
   ticker currently in the Issuer Console table.
3. Review screen shows a read-only summary of the entered values.
4. **Submit for review** re-validates (in case another request was created
   in the meantime) and, if still valid, builds a new `IssuanceRequest` with
   `status: 'pending'` and hands it to the parent page, which prepends it to
   the table.
5. Success screen confirms submission and offers **Create another** (resets
   the form) or **Done** (closes the modal).

## Data model

### Validation — `src/lib/assetCreationRequest.ts`

Pure module (no React / SDK imports), mirroring `mintRequest.ts`'s pattern:

- `AssetCreationInput` — assetName, ticker, amount (string), jurisdiction,
  assetClass
- `AssetCreationContext` — optional `existingTickers`, optional soft
  `maxAmount`
- `validateAssetCreationRequest()` — returns
  `{ valid, error?, parsedAmount?, normalisedTicker? }`

### Supported jurisdictions and asset classes

`SUPPORTED_JURISDICTIONS` and `ASSET_CLASS_OPTIONS` are exported constants
in the same module, used to populate the wizard's select inputs and to
validate submissions.

### Result — `src/fixtures/issuer.ts` (`IssuanceRequest`)

The wizard's output is shaped directly as an `IssuanceRequest`, so it can be
added straight into the existing Issuer Console table with no adapter layer.

## Edge cases

| Case | Behaviour |
|---|---|
| Empty asset name / ticker / amount / jurisdiction / asset class | Blocked before review |
| Asset name under 3 characters | Blocked client-side |
| Malformed ticker (not 2-10 alphanumeric, optional single hyphen segment) | Blocked client-side |
| Ticker already used by an existing request | Blocked client-side (case-insensitive) |
| Zero / negative / non-numeric amount | Blocked client-side |
| Amount above soft cap (`DEFAULT_ASSET_CREATION_MAX_AMOUNT`) | Blocked client-side |
| Unsupported jurisdiction | Blocked client-side against `SUPPORTED_JURISDICTIONS` |
| Ticker becomes a duplicate between form and confirm (e.g. two tabs) | Re-validated on **Submit for review**, sent back to the form with an error |

## Security & compliance assumptions

- `SUPPORTED_JURISDICTIONS` is a **mock-mode UI allow-list**, not a
  determination of real regulatory eligibility. It must not be presented as
  legal or compliance advice — copy in the wizard follows
  [compliance-safe-wording.md](compliance-safe-wording.md).
- Creating a request here does **not** mint any supply and does not touch
  the SDK/provider layer at all; it only writes into local Issuer Console
  state (mock-mode fixture data). A live backend would need a real
  create-issuance-request API and persistence — this wizard's shape is
  designed so that swap-in is additive (see
  [mock-mode.md](mock-mode.md) for the project's general mock/live boundary
  convention).
- Duplicate-ticker and amount-cap checks are UX guards only, not contract or
  registry-level authorization.

## Testing

| Layer | Location |
|---|---|
| Pure validation | `src/lib/assetCreationRequest.test.ts` |
| Wizard (form validation, duplicate ticker, review, submit, reset, cancel) | `src/features/asset-creation/components/AssetCreationWizard.test.tsx` |

## Related

- Issue #29 — Add RWA asset creation wizard
- Issue #6 — RWA asset minting workflow (the counterpart this flow feeds into)
- `MintWorkflow.tsx` is the UX template this wizard mirrors