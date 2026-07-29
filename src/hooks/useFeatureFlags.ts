import { create } from 'zustand';
import { isMockModeEnabled } from '@/config/mockMode';

/**
 * Registry of all feature flags available in the Aegis Dashboard.
 *
 * Adding a new flag:
 * 1. Add the key here.
 * 2. Add a default value in DEFAULT_FLAGS.
 * 3. Add a human-readable label/description in FLAG_METADATA.
 *
 * NOTE: Flags are UI-only. They do not gate any on-chain / Soroban
 * contract behaviour and are not a substitute for protocol-level
 * compliance checks (e.g. whitelist status). See docs/feature-flags.md.
 */
export type FeatureFlagKey =
  | 'newMintFlow'
  | 'complianceBanner'
  | 'darkMode'
  | 'mockMode'
  | 'performanceBudgetReview';

export interface FeatureFlagMeta {
  label: string;
  description: string;
}

export const FLAG_METADATA: Record<FeatureFlagKey, FeatureFlagMeta> = {
  newMintFlow: {
    label: 'New Mint Flow',
    description: 'Enables the redesigned admin mint experience (asset selector, compliance pre-check, review, receipt). Default on.',
  },
  complianceBanner: {
    label: 'Compliance Banner',
    description: 'Shows the protocol-level compliance disclaimer banner.',
  },
  darkMode: {
    label: 'Dark Mode',
    description: 'Enables dark theme across the dashboard.',
  },
  mockMode: {
    label: 'Mock Mode',
    description:
      'Uses local fixture data instead of live SDK calls. For local development only — never enable on testnet or mainnet.',
  },
  performanceBudgetReview: {
    label: 'Performance Budget Review',
    description:
      'Enables the performance budget review panel in the diagnostics section. For testing budget threshold evaluation.',
  },
};

const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  // Issue #6 — guided RWA mint workflow is the default admin mint experience.
  // Toggle off in the feature-flags panel to fall back to the legacy fixed-amount panel.
  newMintFlow: true,
  complianceBanner: true,
  darkMode: false,
  mockMode: isMockModeEnabled(),
  performanceBudgetReview: false,
};

interface FeatureFlagsState {
  flags: Record<FeatureFlagKey, boolean>;
  toggleFlag: (key: FeatureFlagKey) => void;
  setFlag: (key: FeatureFlagKey, value: boolean) => void;
  resetFlags: () => void;
  isEnabled: (key: FeatureFlagKey) => boolean;
}

export const useFeatureFlags = create<FeatureFlagsState>((set, get) => ({
  flags: { ...DEFAULT_FLAGS },

  toggleFlag: (key) => {
    // Guard against unknown/removed keys reaching the store
    // (e.g. via stale references or future persistence layers).
    if (!(key in DEFAULT_FLAGS)) {
      console.warn(`useFeatureFlags: attempted to toggle unknown flag "${key}"`);
      return;
    }
    set((state) => ({
      flags: { ...state.flags, [key]: !state.flags[key] },
    }));
  },

  setFlag: (key, value) => {
    if (!(key in DEFAULT_FLAGS)) {
      console.warn(`useFeatureFlags: attempted to set unknown flag "${key}"`);
      return;
    }
    set((state) => ({
      flags: { ...state.flags, [key]: value },
    }));
  },

  resetFlags: () => set({ flags: { ...DEFAULT_FLAGS } }),

  isEnabled: (key) => get().flags[key] ?? false,
}));
