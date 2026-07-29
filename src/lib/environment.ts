/**
 * Environment mismatch detection for the Aegis Dashboard (Issue #36).
 *
 * Compares the wallet's connected network against the dashboard's target
 * network (from NEXT_PUBLIC_NETWORK_PASSPHRASE) and returns a blocking state
 * when they don't match. This ensures users cannot interact with the dashboard
 * while connected to the wrong network.
 *
 * IMPORTANT: This is a protocol-level network check. It does not make a legal,
 * regulatory, or financial determination about the user's wallet or jurisdiction.
 */

export type EnvironmentMismatchState = 'match' | 'mismatch' | 'no_wallet' | 'checking';

export interface EnvironmentMismatchResult {
  state: EnvironmentMismatchState;
  title: string;
  message: string;
  targetNetwork: string;
  walletNetwork?: string;
}

const KNOWN_PASSPHRASES: Record<string, string> = {
  PUBLIC: 'Public Global Stellar Network ; September 2015',
  TESTNET: 'Test SDF Network ; September 2015',
  'Public Global Stellar Network ; September 2015': 'Public Global Stellar Network ; September 2015',
  'Test SDF Network ; September 2015': 'Test SDF Network ; September 2015',
};

const NETWORK_LABELS: Record<string, string> = {
  'Public Global Stellar Network ; September 2015': 'Stellar Mainnet (PUBLIC)',
  'Test SDF Network ; September 2015': 'Stellar Testnet (TESTNET)',
};

export function getTargetNetwork(): string {
  const passphrase = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
  return passphrase || 'Test SDF Network ; September 2015';
}

export function formatNetworkLabel(passphrase: string): string {
  return NETWORK_LABELS[passphrase] ?? passphrase;
}

/**
 * Resolve a wallet network value to a canonical passphrase string.
 *
 * Freighter's getNetwork() returns an object with networkPassphrase, but the
 * current useWallet type annotation treats it as string | null. This function
 * handles both shapes and resolves short network names (e.g. 'TESTNET') to
 * their full passphrase.
 */
export function resolvePassphrase(walletNetwork: unknown): string | null {
  if (!walletNetwork) return null;

  if (typeof walletNetwork === 'object') {
    const record = walletNetwork as Record<string, unknown>;
    const passphrase = record.networkPassphrase;
    if (typeof passphrase === 'string' && passphrase) return passphrase;
    const network = record.network;
    if (typeof network === 'string' && network) {
      return KNOWN_PASSPHRASES[network] ?? network;
    }
    return null;
  }

  if (typeof walletNetwork === 'string') {
    return KNOWN_PASSPHRASES[walletNetwork] ?? walletNetwork;
  }

  return null;
}

/**
 * Evaluate whether the connected wallet's network matches the dashboard target.
 *
 * Fail-closed: when the wallet is not connected, returns no_wallet so the
 * RouteGuard can handle wallet-required logic. When the wallet is connected but
 * network is not yet known, returns checking.
 */
export function evaluateEnvironmentMismatch(
  walletNetwork: unknown,
  isWalletConnected: boolean,
): EnvironmentMismatchResult {
  const target = getTargetNetwork();
  const targetLabel = formatNetworkLabel(target);

  if (!isWalletConnected) {
    return {
      state: 'no_wallet',
      title: 'No wallet connected',
      message: 'Connect your wallet to verify the network.',
      targetNetwork: targetLabel,
    };
  }

  const passphrase = resolvePassphrase(walletNetwork);

  if (!passphrase) {
    return {
      state: 'checking',
      title: 'Checking network…',
      message: 'Verifying your wallet network configuration.',
      targetNetwork: targetLabel,
    };
  }

  const walletLabel = formatNetworkLabel(passphrase);

  if (passphrase === target) {
    return {
      state: 'match',
      title: '',
      message: '',
      targetNetwork: targetLabel,
      walletNetwork: walletLabel,
    };
  }

  return {
    state: 'mismatch',
    title: 'Wrong wallet network',
    message:
      `Your wallet is connected to ${walletLabel}, but this dashboard expects ` +
      `${targetLabel}. Switch your wallet to the correct network before continuing.`,
    targetNetwork: targetLabel,
    walletNetwork: walletLabel,
  };
}
