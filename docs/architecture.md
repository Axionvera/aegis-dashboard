# Frontend Architecture

## Component Hierarchy
The UI is strictly separated into pages and domain-specific features:
- `pages/`: Handles routing and route-level authorization (e.g., checking if the wallet is connected).
- `features/`: Contains domain-specific components, hooks, and logic (e.g., `admin`, `portfolio`).
- `components/layout/`: Contains reusable, global UI layout elements like `Navbar.tsx`.

## State Management
- **Wallet State:** Handled globally using `zustand` in `src/hooks/useWallet.ts`. This allows any component to access the connected Stellar address.
- **Contract State:** Interactions with the Soroban RPC are abstracted into `src/hooks/useAegis.ts`, which currently wraps the `@aegis/sdk`.
- **Transaction History State:** Normalized activity records are managed in `src/features/transactions/store.ts` and consumed by `src/components/TransactionHistory.tsx`.
- **Auth / Role State:** Wallet role resolution and route access state are managed in `src/features/auth/store.ts` and evaluated through `src/lib/route-guard.ts`.

## Feature Modules
- `src/features/transactions/` encapsulates:
  - canonical transaction types
  - source normalization mappers
  - filtering utilities
  - fixtures for major transaction classes
  - state store for list/detail UI
- `src/features/auth/` encapsulates:
  - dashboard role model and route access config
  - SDK-backed role resolution (mocked)
  - route guard hook and fixtures for access states
- `src/features/compliance/` encapsulates:
  - address-level compliance status panel
  - SDK raw-record mapping and safe explanatory copy
  - fixtures covering approved / blocked / pending / revoked / unknown / unavailable
- `src/components/transactions/` provides the shared review-before-sign UI:
  - `TransactionReview` / `TransactionReviewModal`
  - `operationSummary` mapper for transfer, mint, whitelist, and compliance updates
  - progress / receipt / status mapping used by all sensitive signing flows
- `src/features/admin/receipts/` encapsulates:
  - admin operation receipt types for whitelist, mint, asset registration, and role changes
  - SDK/local-outcome mapping onto shared transaction status and explorer helpers
  - next-action guidance and fixtures for all receipt states