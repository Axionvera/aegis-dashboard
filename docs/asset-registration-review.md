# Asset Registration Review Step

The RWA asset creation wizard (`src/features/asset-creation/components/AssetCreationWizard.tsx`)
requires a review-before-submit step so issuers confirm what they are sending
for compliance review. This documents the review flow and its warning states.

## Flow

```
form  ->  review  ->  success
```

1. **Form** — the issuer enters asset name, ticker, asset class, initial
   requested supply, and jurisdiction. Field-level validation runs on
   "Review request".
2. **Review** — a read-only summary of the request. The issuer must
   explicitly confirm before anything is submitted.
3. **Success** — an admin action receipt confirms the request was created in
   `pending` status.

## Review step contents

The review screen shows:

- **Validation summary** — a checklist confirming required fields, ticker
  format/uniqueness, and supply bounds passed.
- **Request details** — asset name, ticker, asset class, issuer (the
  submitting wallet, truncated), initial requested supply, jurisdiction, and
  the target **network** (from `NEXT_PUBLIC_NETWORK_PASSPHRASE`, resolved via
  `formatNetworkLabel`).
- **Warning states** — non-blocking amber warnings surfaced when:
  - requested supply exceeds 50% of the soft cap
    (`DEFAULT_ASSET_CREATION_MAX_AMOUNT`), or
  - the jurisdiction is outside the supported list.

Warnings are informational only — they do not block submission, but they flag
requests that compliance review should scrutinise more closely.

## Notes

- The issuer address is truncated for display (`ABCDEF…7890`) and is never
  used to make a legal or regulatory determination.
- The review is a protocol-level compliance check only and is not legal or
  financial advice.
- Submitting creates an `IssuanceRequest` in `pending` status; the asset
  becomes mintable only after a separate compliance approval step.
