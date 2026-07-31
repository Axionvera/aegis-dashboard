import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateEnvironmentMismatch,
  getTargetNetwork,
  formatNetworkLabel,
  resolvePassphrase,
  toStoredNetwork,
} from './environment';
import { ENVIRONMENT_MISMATCH_FIXTURES } from './__fixtures__/environment';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
});

describe('evaluateEnvironmentMismatch', () => {
  it.each(ENVIRONMENT_MISMATCH_FIXTURES)(
    'returns $expectedState for $label',
    ({ walletNetwork, isWalletConnected, expectedState }) => {
      const result = evaluateEnvironmentMismatch(walletNetwork, isWalletConnected);
      expect(result.state).toBe(expectedState);
    },
  );

  it('includes target and wallet network on mismatch', () => {
    const result = evaluateEnvironmentMismatch(
      {
        network: 'PUBLIC',
        networkPassphrase: 'Public Global Stellar Network ; September 2015',
      },
      true,
    );
    expect(result.state).toBe('mismatch');
    expect(result.targetNetwork).toBe('Stellar Testnet (TESTNET)');
    expect(result.walletNetwork).toBe('Stellar Mainnet (PUBLIC)');
  });

  it('handles custom passphrase not in known labels', () => {
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Custom Network Passphrase';
    const result = evaluateEnvironmentMismatch(
      'Other Network Passphrase',
      true,
    );
    expect(result.state).toBe('mismatch');
    expect(result.targetNetwork).toBe('Custom Network Passphrase');
    expect(result.walletNetwork).toBe('Other Network Passphrase');
  });

  it('target network uses the env var when set', () => {
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Some Other Passphrase';
    const result = evaluateEnvironmentMismatch(
      { networkPassphrase: 'Some Other Passphrase' },
      true,
    );
    expect(result.state).toBe('match');
  });

  it('no_wallet state does not include walletNetwork', () => {
    const result = evaluateEnvironmentMismatch(null, false);
    expect(result.state).toBe('no_wallet');
    expect(result.walletNetwork).toBeUndefined();
  });
});

describe('getTargetNetwork', () => {
  it('reads from NEXT_PUBLIC_NETWORK_PASSPHRASE when set', () => {
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Custom Passphrase';
    expect(getTargetNetwork()).toBe('Custom Passphrase');
  });

  it('defaults to Stellar testnet when env var is not set', () => {
    delete process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
    expect(getTargetNetwork()).toBe('Test SDF Network ; September 2015');
  });

  it('defaults when env var is empty string', () => {
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = '';
    expect(getTargetNetwork()).toBe('Test SDF Network ; September 2015');
  });
});

describe('formatNetworkLabel', () => {
  it('returns friendly label for known passphrases', () => {
    expect(formatNetworkLabel('Test SDF Network ; September 2015'))
      .toBe('Stellar Testnet (TESTNET)');
    expect(formatNetworkLabel('Public Global Stellar Network ; September 2015'))
      .toBe('Stellar Mainnet (PUBLIC)');
  });

  it('returns the passphrase itself for unknown values', () => {
    expect(formatNetworkLabel('Some Unknown Network')).toBe('Some Unknown Network');
  });
});

describe('resolvePassphrase', () => {
  it('extracts networkPassphrase from an object', () => {
    expect(resolvePassphrase({ networkPassphrase: 'Test SDF Network ; September 2015' }))
      .toBe('Test SDF Network ; September 2015');
  });

  it('resolves short network name from an object', () => {
    expect(resolvePassphrase({ network: 'TESTNET' }))
      .toBe('Test SDF Network ; September 2015');
  });

  it('returns null for null input', () => {
    expect(resolvePassphrase(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(resolvePassphrase(undefined)).toBeNull();
  });

  it('returns null for an empty object', () => {
    expect(resolvePassphrase({})).toBeNull();
  });
});

describe('toStoredNetwork', () => {
  it('prefers Freighter\'s short network name over the passphrase', () => {
    expect(
      toStoredNetwork({
        network: 'TESTNET',
        networkPassphrase: 'Test SDF Network ; September 2015',
      }),
    ).toBe('TESTNET');
  });

  it('falls back to the passphrase when the short name is missing', () => {
    expect(
      toStoredNetwork({ networkPassphrase: 'Test SDF Network ; September 2015' }),
    ).toBe('Test SDF Network ; September 2015');
  });

  it('passes a bare string through unchanged', () => {
    expect(toStoredNetwork('PUBLIC')).toBe('PUBLIC');
  });

  it('returns null for empty or unusable values', () => {
    expect(toStoredNetwork(null)).toBeNull();
    expect(toStoredNetwork({})).toBeNull();
    expect(toStoredNetwork('')).toBeNull();
  });
});
