/**
 * Wallet network guard fixtures (Issue #180).
 *
 * Every combination the guard can produce, so tests and any future preview
 * gallery exercise the same set. Expectations assume the default target
 * network (Stellar testnet) that `getTargetNetwork()` falls back to when
 * `NEXT_PUBLIC_NETWORK_PASSPHRASE` is unset.
 */

import type { GuardedActionId, NetworkGuardDecision, NetworkGuardStatus } from './types';

export const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
export const PUBLIC_PASSPHRASE = 'Public Global Stellar Network ; September 2015';

export interface NetworkGuardFixture {
  id: string;
  label: string;
  walletNetwork: unknown;
  isWalletConnected: boolean;
  isMockMode: boolean;
  action: GuardedActionId;
  expectedStatus: NetworkGuardStatus;
  expectedDecision: NetworkGuardDecision;
}

export const NETWORK_GUARD_FIXTURES: NetworkGuardFixture[] = [
  {
    id: 'signing-match',
    label: 'Transfer with wallet on the target network',
    walletNetwork: { network: 'TESTNET', networkPassphrase: TESTNET_PASSPHRASE },
    isWalletConnected: true,
    isMockMode: false,
    action: 'transfer',
    expectedStatus: 'match',
    expectedDecision: 'allow',
  },
  {
    id: 'signing-mismatch',
    label: 'Transfer with wallet on mainnet while the dashboard targets testnet',
    walletNetwork: { network: 'PUBLIC', networkPassphrase: PUBLIC_PASSPHRASE },
    isWalletConnected: true,
    isMockMode: false,
    action: 'transfer',
    expectedStatus: 'mismatch',
    expectedDecision: 'block',
  },
  {
    id: 'signing-mismatch-string',
    label: 'Mint with the network reported as a bare string',
    walletNetwork: 'PUBLIC',
    isWalletConnected: true,
    isMockMode: false,
    action: 'mint',
    expectedStatus: 'mismatch',
    expectedDecision: 'block',
  },
  {
    id: 'signing-unknown',
    label: 'Whitelist addition with an unreadable wallet network',
    walletNetwork: {},
    isWalletConnected: true,
    isMockMode: false,
    action: 'whitelist-add',
    expectedStatus: 'unknown',
    expectedDecision: 'block',
  },
  {
    id: 'signing-disconnected',
    label: 'Whitelist removal with no wallet connected',
    walletNetwork: null,
    isWalletConnected: false,
    isMockMode: false,
    action: 'whitelist-remove',
    expectedStatus: 'disconnected',
    expectedDecision: 'block',
  },
  {
    id: 'signing-mock',
    label: 'Mint in mock mode, where no real network is involved',
    walletNetwork: 'LOCAL_MOCK',
    isWalletConnected: true,
    isMockMode: true,
    action: 'mint',
    expectedStatus: 'mock',
    expectedDecision: 'allow',
  },
  {
    id: 'local-mismatch',
    label: 'Compliance update with the wallet on the wrong network',
    walletNetwork: { networkPassphrase: PUBLIC_PASSPHRASE },
    isWalletConnected: true,
    isMockMode: false,
    action: 'compliance-update',
    expectedStatus: 'mismatch',
    expectedDecision: 'warn',
  },
  {
    id: 'local-unknown',
    label: 'Asset registration with an unreadable wallet network',
    walletNetwork: null,
    isWalletConnected: true,
    isMockMode: false,
    action: 'asset-registration',
    expectedStatus: 'unknown',
    expectedDecision: 'allow',
  },
];
