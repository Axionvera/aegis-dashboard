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

## Feature Modules
- `src/features/transactions/` encapsulates:
  - canonical transaction types
  - source normalization mappers
  - filtering utilities
  - fixtures for major transaction classes
  - state store for list/detail UI