import { create } from 'zustand';
import { isConnected, isAllowed, requestAccess, getPublicKey, getNetwork } from '@stellar/freighter-api';
import { resolvePassphrase, toStoredNetwork } from '@/lib/environment';

interface WalletState {
  address: string | null;
  /**
   * Stable network string for the connected wallet — Freighter's short name
   * (`TESTNET` / `PUBLIC`) when available, otherwise the passphrase. Never the
   * raw Freighter object: callers treat this as a string (e.g. `.trim()`).
   */
  network: string | null;
  isConnecting: boolean;
  /** Set when connection fails; cleared on a successful connect or disconnect. */
  connectionError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Silently restore a previously-granted Freighter session on page load. */
  tryAutoReconnect: () => Promise<void>;
  /**
   * Re-read the wallet's current network without prompting the user. Freighter
   * does not emit an event when the user switches networks, so callers must
   * poll this to notice a switch that happened after connect.
   */
  refreshNetwork: () => Promise<void>;
}

export const useWallet = create<WalletState>((set, get) => ({
  address: null,
  network: null,
  isConnecting: false,
  connectionError: null,

  connect: async () => {
    set({ isConnecting: true, connectionError: null });
    try {
      const installed = await isConnected();
      if (!installed) {
        set({
          isConnecting: false,
          connectionError: 'Freighter wallet is not installed. Visit https://www.freighter.app/ to install it.',
        });
        return;
      }

      const access = await requestAccess();
      const networkDetails = await getNetwork();

      set({
        address: access,
        network: toStoredNetwork(networkDetails),
        isConnecting: false,
        connectionError: null,
      });
    } catch (error) {
      console.error('Wallet connection failed', error);
      set({
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : 'Wallet connection failed. Please try again.',
      });
    }
  },

  /**
   * Silently restores a Freighter session that was already granted before the
   * last page load. Does nothing if Freighter is not installed, not allowed, or
   * if the key is empty (extension locked). Call once in _app.tsx on mount.
   *
   * Uses `isAllowed()` (no popup) rather than `requestAccess()` (popup) so the
   * user is never prompted unexpectedly on refresh.
   */
  tryAutoReconnect: async () => {
    try {
      const installed = await isConnected();
      if (!installed) return;

      const alreadyAllowed = await isAllowed();
      if (!alreadyAllowed) return;

      const publicKey = await getPublicKey();
      if (!publicKey) return;

      const networkDetails = await getNetwork();
      set({
        address: publicKey,
        network: toStoredNetwork(networkDetails),
        connectionError: null,
      });
    } catch {
      // Auto-reconnect is best-effort — never surface errors to the user.
    }
  },

  refreshNetwork: async () => {
    if (!get().address) return;

    try {
      const networkDetails = await getNetwork();
      const next = toStoredNetwork(networkDetails);
      // Freighter returns a fresh object every call, so compare by resolved
      // passphrase rather than by reference — otherwise every poll would
      // rewrite the store and re-render the app for no reason.
      if (resolvePassphrase(next) !== resolvePassphrase(get().network)) {
        set({ network: next });
      }
    } catch {
      // Leave the previous value in place. A transient Freighter failure must
      // not wipe a known-good network and falsely unlock a signing action.
    }
  },

  disconnect: () => {
    set({ address: null, network: null, connectionError: null });
  },
}));
