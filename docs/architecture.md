# Frontend Architecture

## Component Hierarchy
The UI is strictly separated into pages and domain-specific features:
- `pages/`: Handles routing and route-level authorization (e.g., checking if the wallet is connected).
- `features/`: Contains domain-specific components, hooks, and logic (e.g., `admin`, `portfolio`).
- `components/layout/`: Contains reusable, global UI layout elements like `Navbar.tsx`.

## State Management
- **Wallet State:** Handled globally using `zustand` in `src/hooks/useWallet.ts`. This allows any component to access the connected Stellar address.
- **Contract State:** Interactions with the Soroban RPC are abstracted into `src/hooks/useAegis.ts`, which currently wraps the `@aegis/sdk`.