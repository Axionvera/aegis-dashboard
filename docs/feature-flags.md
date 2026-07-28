Feature Flags
The Aegis Dashboard includes a lightweight, client-side feature flag system for toggling experimental UI behaviour without a code deploy.
Overview
Flags are managed by a [zustand](https://github.com/pmndrs/zustand) store at `src/hooks/useFeatureFlags.ts`, following the same pattern as `useWallet.ts`. The panel UI lives at `src/components/FeatureFlagsPanel.tsx` and is currently surfaced on the `/admin` page.

```ts
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const isNewMintFlowEnabled = useFeatureFlags((s) => s.flags.newMintFlow);

```

Adding a new flag

1. Add the key to the `FeatureFlagKey` union in `useFeatureFlags.ts`.
2. Add a default value to `DEFAULT_FLAGS`.
3. Add a `label` and `description` to `FLAG_METADATA` — this is what renders in the panel, so keep it short and unambiguous.
4. Add or update tests in `src/__tests__/hooks/useFeatureFlags.test.ts`.

Scope and boundaries

* This is a UI-only mechanism. Flags do not call the Soroban contract layer, `useAegis`, or any SDK, and they carry no on-chain state.
* Flags are not persisted. State resets on page refresh (in-memory zustand store only). Persistence (e.g. localStorage, a backend, or per-wallet settings) is intentionally out of scope for the initial implementation and should be a separate, explicit follow-up if needed.
* Flags are not a compliance control. Toggling a flag changes what the UI shows or which code path runs in the browser; it has no effect on whitelist status, minting permissions, or any other protocol-level compliance check enforced by the underlying contracts. Nothing in this document, or in the panel itself, should be read as legal or financial advice regarding compliance status.

Edge cases handled

* Unknown flag key: `toggleFlag` / `setFlag` no-op and log a warning rather than writing an arbitrary key into state.
* Repeated toggles: toggling a flag twice returns it to its original value (covered by tests).
* Reset: `resetFlags()` restores all flags to their defaults, useful for tests and for a future "reset to defaults" UI action.

Related

* `architecture.md` — overall frontend architecture and state management conventions.