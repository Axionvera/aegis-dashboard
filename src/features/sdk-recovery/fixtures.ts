import type { SdkErrorCategory } from '@/features/sdk-recovery/types';

/**
 * Representative failures for every SDK error category (issue #43).
 *
 * These are the shapes the mock client, Freighter and Soroban RPC actually
 * produce, so they double as regression fixtures for `classifySdkError` and as
 * sample data when building recovery UI.
 */

export interface SdkErrorFixture {
  /** Stable id, handy for storybook-style pickers and test names. */
  id: string;
  label: string;
  /** The category `classifySdkError` is expected to return. */
  expected: SdkErrorCategory;
  /** The value an SDK call would throw or return. */
  failure: unknown;
  /** Context hints available to the caller at the time of the failure. */
  context?: { walletConnected?: boolean; networkMatches?: boolean };
}

export const SDK_ERROR_FIXTURES: SdkErrorFixture[] = [
  {
    id: 'wallet-locked',
    label: 'Freighter locked or not installed',
    expected: 'wallet_unavailable',
    failure: new Error('Freighter is not available. Please install Freighter wallet.'),
  },
  {
    id: 'wallet-disconnected-context',
    label: 'Caller already knows the wallet is disconnected',
    expected: 'wallet_unavailable',
    failure: new Error('Request failed'),
    context: { walletConnected: false },
  },
  {
    id: 'signature-declined',
    label: 'User declined the signature prompt',
    expected: 'wallet_rejected',
    failure: new Error('User declined the transaction request.'),
  },
  {
    id: 'network-mismatch',
    label: 'Wallet on PUBLIC while dashboard targets TESTNET',
    expected: 'network_mismatch',
    failure: { status: 'ERROR', errorMessage: 'Network mismatch: expected TESTNET.' },
  },
  {
    id: 'rpc-unreachable',
    label: 'RPC host unreachable',
    expected: 'network_unreachable',
    failure: new TypeError('Failed to fetch'),
  },
  {
    id: 'rpc-5xx',
    label: 'RPC returned 503',
    expected: 'network_unreachable',
    failure: { status: 'ERROR', code: 503, errorMessage: 'Service Unavailable' },
  },
  {
    id: 'timeout',
    label: 'Submission aborted after the deadline',
    expected: 'timeout',
    failure: new Error('The operation timed out after 30000ms'),
  },
  {
    id: 'rate-limited',
    label: 'RPC throttling this client',
    expected: 'rate_limited',
    failure: { status: 'TRY_AGAIN_LATER', code: 429, errorMessage: 'Rate limit exceeded' },
  },
  {
    id: 'compliance-blocked',
    label: 'Recipient not authorised to hold the asset',
    expected: 'compliance_blocked',
    failure: {
      status: 'FAILED',
      errorMessage: 'Recipient account is not authorised to hold this asset.',
    },
  },
  {
    id: 'insufficient-funds',
    label: 'Balance below the transfer amount',
    expected: 'insufficient_funds',
    failure: { status: 'FAILED', errorMessage: 'tx_insufficient_balance' },
  },
  {
    id: 'invalid-address',
    label: 'Malformed destination address',
    expected: 'invalid_input',
    failure: new Error('Invalid destination address: GXXX'),
  },
  {
    id: 'indeterminate-hash',
    label: 'Submitted but status not readable',
    expected: 'indeterminate',
    failure: { status: 'NOT_FOUND', hash: 'mock_tx_hash_1234567890' },
  },
  {
    id: 'unknown-null',
    label: 'Nothing usable came back',
    expected: 'unknown',
    failure: null,
  },
  {
    id: 'unknown-shape',
    label: 'Unrecognised object with no message',
    expected: 'unknown',
    failure: { unexpected: true },
  },
];

export const getSdkErrorFixture = (id: string): SdkErrorFixture => {
  const fixture = SDK_ERROR_FIXTURES.find((candidate) => candidate.id === id);
  if (!fixture) throw new Error(`Unknown SDK error fixture: ${id}`);
  return fixture;
};
