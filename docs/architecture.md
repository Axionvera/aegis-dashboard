# Frontend Architecture

## Component Hierarchy
The UI is separated into pages, feature modules, and shared components:
- `pages/`: Handles routing and route-level authorization (e.g., checking if the wallet is connected). Pages should stay thin and delegate real rendering logic to feature components.
- `features/<domain>/`: Domain-specific logic and UI that isn't generic enough to live in `components/`. For example, `features/investor/` owns the portfolio dashboard (list, loading/empty/error states, transfer flow) and `features/assets/` owns generic asset-display building blocks (`AssetCard`, compliance/eligibility badges) that other features (e.g. a future issuer dashboard) can reuse. Each feature keeps its own `hooks/` and `components/` subfolders.
- `components/`: Truly cross-cutting UI with no domain logic (`Navbar`, `AdminPanel`). State should be kept as local as possible unless required globally.

## State Management
- **Wallet State:** Handled globally using `zustand` in `src/hooks/useWallet.ts`. This allows any component to access the connected Stellar address.
- **Contract/SDK State:** Interactions with the Soroban RPC are abstracted into `src/hooks/useAegis.ts`, which wraps `src/lib/aegis/client.ts` — a mock stand-in for the not-yet-published `@aegis/sdk`. Feature-level hooks (e.g. `usePortfolio`) build on top of `useAegis` to add loading/error/empty semantics specific to a screen, so components never call the SDK client directly. See `docs/investor-dashboard.md` for the portfolio read-model shape.