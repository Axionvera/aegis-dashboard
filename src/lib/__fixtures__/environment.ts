import type { EnvironmentMismatchState } from '../environment';

export interface EnvironmentMismatchFixture {
  id: string;
  label: string;
  walletNetwork: unknown;
  isWalletConnected: boolean;
  expectedState: EnvironmentMismatchState;
}

export const ENVIRONMENT_MISMATCH_FIXTURES: EnvironmentMismatchFixture[] = [
  {
    id: 'match-testnet',
    label: 'Wallet on testnet, target is testnet',
    walletNetwork: {
      network: 'TESTNET',
      networkPassphrase: 'Test SDF Network ; September 2015',
    },
    isWalletConnected: true,
    expectedState: 'match',
  },
  {
    id: 'mismatch-mainnet',
    label: 'Wallet on mainnet, target is testnet',
    walletNetwork: {
      network: 'PUBLIC',
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
    },
    isWalletConnected: true,
    expectedState: 'mismatch',
  },
  {
    id: 'no-wallet',
    label: 'No wallet connected',
    walletNetwork: null,
    isWalletConnected: false,
    expectedState: 'no_wallet',
  },
  {
    id: 'checking-network',
    label: 'Wallet connected but network info not yet available',
    walletNetwork: null,
    isWalletConnected: true,
    expectedState: 'checking',
  },
  {
    id: 'match-string-network',
    label: 'Wallet network as string matching target',
    walletNetwork: 'TESTNET',
    isWalletConnected: true,
    expectedState: 'match',
  },
  {
    id: 'mismatch-string-network',
    label: 'Wallet network as string not matching target',
    walletNetwork: 'PUBLIC',
    isWalletConnected: true,
    expectedState: 'mismatch',
  },
  {
    id: 'checking-empty-object',
    label: 'Wallet network is an empty object',
    walletNetwork: {},
    isWalletConnected: true,
    expectedState: 'checking',
  },
];
