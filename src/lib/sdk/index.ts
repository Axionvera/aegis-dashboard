/**
 * src/lib/sdk/index.ts — Provider factory
 *
 * This is the single import point for SDK access across the entire app.
 * It reads the runtime mock-mode flag, validates the environment, and returns
 * either the MockAegisProvider (local dev) or the LiveAegisProvider (real
 * network calls).
 *
 * Usage
 * -----
 * ```ts
 * import { getAegisProvider } from '@/lib/sdk';
 * const provider = getAegisProvider();
 * const portfolio = await provider.getPortfolio(address);
 * ```
 *
 * The `useAegis` hook calls this; components and other hooks should go
 * through `useAegis` rather than importing the provider directly.
 */

import { isMockModeEnabled, assertMockModeSafe } from '@/config/mockMode';
import { MockAegisProvider } from './MockAegisProvider';
import { LiveAegisProvider } from './LiveAegisProvider';
import type { IAegisProvider } from './IAegisProvider';

export type { IAegisProvider, PhaseListener } from './IAegisProvider';

let _provider: IAegisProvider | null = null;

/**
 * Returns the singleton provider instance, creating it on first call.
 * The choice of provider is determined once at startup so it cannot change
 * mid-session.
 */
export function getAegisProvider(): IAegisProvider {
  if (_provider) return _provider;

  if (isMockModeEnabled()) {
    // Throws in non-development environments, acting as a hard guard.
    assertMockModeSafe();
    _provider = new MockAegisProvider();
    console.warn(
      '[Aegis] Mock mode is active. All SDK calls return fixture data. ' +
        'Set NEXT_PUBLIC_MOCK_MODE=false (or remove it) to use live data.',
    );
  } else {
    _provider = new LiveAegisProvider();
  }

  return _provider;
}

/**
 * Returns `true` when the active provider is the MockAegisProvider.
 * Used by the MockModeBanner and DiagnosticsPanel to surface warnings.
 */
export function isProviderMocked(): boolean {
  return getAegisProvider() instanceof MockAegisProvider;
}

/**
 * Reset the provider singleton. Only for use in tests.
 * @internal
 */
export function _resetProvider(): void {
  _provider = null;
}
