/**
 * Mock mode configuration helper.
 *
 * Mock mode replaces every Aegis SDK call with a local in-memory provider
 * that returns deterministic fixture data. It exists solely to allow frontend
 * contributors to develop and test the UI without a live Soroban RPC endpoint
 * or deployed contracts.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Mock mode MUST only be enabled in local development environments.
 * - It MUST never be enabled on testnet or mainnet deployments.
 * - Fixture data is clearly labelled and does not represent real balances,
 *   real compliance decisions, or real on-chain state.
 * - The UI renders a persistent warning banner whenever mock mode is active
 *   (see src/components/MockModeBanner.tsx).
 *
 * Usage
 * -----
 * Set NEXT_PUBLIC_MOCK_MODE="true" in your .env.local file.
 * See docs/mock-mode.md for full setup instructions.
 */

/**
 * Returns `true` when the NEXT_PUBLIC_MOCK_MODE environment variable is set
 * to the exact string `"true"`. Any other value (including absence) is treated
 * as `false` so the flag cannot be accidentally activated in production.
 */
export function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}

/**
 * Throws if mock mode is active and NODE_ENV is not development.
 * Called once at provider factory initialisation to act as a hard guard
 * against mock data leaking into deployed environments.
 */
export function assertMockModeSafe(): void {
  if (isMockModeEnabled() && process.env.NODE_ENV !== 'development') {
    throw new Error(
      '[Aegis] NEXT_PUBLIC_MOCK_MODE=true is not allowed outside of NODE_ENV=development. ' +
        'Remove or unset NEXT_PUBLIC_MOCK_MODE before deploying.',
    );
  }
}
