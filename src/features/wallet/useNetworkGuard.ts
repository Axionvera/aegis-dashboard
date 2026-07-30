/**
 * React bindings for the wallet network guard (Issue #180).
 */

import { useEffect } from 'react';
import { isMockModeEnabled } from '@/config/mockMode';
import { useWallet } from '@/hooks/useWallet';
import { evaluateNetworkGuard } from './networkGuard';
import type { GuardedActionId, NetworkGuardResult } from './types';

/** How often the watcher re-reads the wallet network while the tab is active. */
export const WALLET_NETWORK_POLL_MS = 5_000;

/**
 * Keeps `useWallet().network` in step with Freighter.
 *
 * Freighter has no "network changed" event, and the store only captures the
 * network at connect time, so a user who switches networks mid-session would
 * otherwise be measured against a stale value. Mount this once at the app
 * shell: every guard, plus the app-shell environment check, reads the store.
 *
 * Polling pauses while the tab is hidden and runs immediately on refocus, so a
 * user returning from the Freighter popup sees the new network at once.
 */
export function useWalletNetworkWatcher(pollMs: number = WALLET_NETWORK_POLL_MS): void {
  const address = useWallet((s) => s.address);
  const refreshNetwork = useWallet((s) => s.refreshNetwork);

  useEffect(() => {
    if (!address || isMockModeEnabled()) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      if (timer === null) timer = setInterval(refreshNetwork, pollMs);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
        return;
      }
      refreshNetwork();
      start();
    };

    refreshNetwork();
    start();
    window.addEventListener('focus', refreshNetwork);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      window.removeEventListener('focus', refreshNetwork);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [address, refreshNetwork, pollMs]);
}

/**
 * Evaluate the network guard for one sensitive action against live wallet
 * state. Re-renders whenever the wallet network or connection changes.
 */
export function useNetworkGuard(action: GuardedActionId): NetworkGuardResult {
  const address = useWallet((s) => s.address);
  const network = useWallet((s) => s.network);

  return evaluateNetworkGuard({
    walletNetwork: network,
    isWalletConnected: address !== null,
    action,
  });
}
