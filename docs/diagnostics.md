# Diagnostics & Troubleshooting

The Diagnostics Page is designed to assist contributors and users in resolving environment configuration issues securely.

## Accessing Diagnostics
Navigate to `/diagnostics` in your local environment.

## What it Reports
The diagnostics page safely aggregates:
- **RPC URL**: Indicates if the Next.js RPC environment variables are loaded. Secrets in the URL path are redacted.
- **Contract ID**: The current Soroban contract ID initialized in the app. Masked to only show the start and end characters.
- **SDK Version**: The version of `@aegis/sdk` being used.
- **Wallet State**: Checks the Freighter connection status and network.
- **Feature Flags**: Serializes the `useFeatureFlags` Zustand store to verify if UI toggles are behaving correctly.

## Sharing a Report
When opening a GitHub Issue or requesting support in Discord, click **Copy Report**. This produces a sanitized JSON blob of your current application state.

The report is built by `buildDiagnosticsReport()` in `src/lib/diagnostics/buildReport.ts`,
a pure function that redacts all sensitive values (RPC URL paths, contract IDs, wallet
addresses) via the shared `redact` helpers. The report and its status cards are
unit-tested with healthy and failing fixtures in
`src/lib/diagnostics/buildReport.test.ts`.

**Example Redacted Report:**
```json
{
  "timestamp": "2026-07-28T12:00:00.000Z",
  "sdkVersion": "Mocked v0.0.0",
  "rpc": "https://rpc.example.com/v1/1...7890",
  "contract": "CABC...3456",
  "wallet": "GBXY...WXYZ",
  "network": "TESTNET",
  "flags": {
    "newMintFlow": true,
    "complianceBanner": true,
    "darkMode": false
  }
}
```
