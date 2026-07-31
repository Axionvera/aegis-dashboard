import { describe, expect, it } from 'vitest';
import { getExplorerUrl } from './explorerLink';

describe('getExplorerUrl', () => {
  it('builds stellar.expert links for supported networks', () => {
    expect(getExplorerUrl('abc123', 'TESTNET')).toBe(
      'https://stellar.expert/explorer/testnet/tx/abc123',
    );
    expect(getExplorerUrl('abc123', 'PUBLIC')).toBe(
      'https://stellar.expert/explorer/public/tx/abc123',
    );
    expect(getExplorerUrl('abc123', 'MAINNET')).toBe(
      'https://stellar.expert/explorer/public/tx/abc123',
    );
  });

  it('returns null when the hash or network is missing/unsupported', () => {
    expect(getExplorerUrl(undefined, 'TESTNET')).toBeNull();
    expect(getExplorerUrl('abc123', null)).toBeNull();
    expect(getExplorerUrl('abc123', 'FUTURENET')).toBeNull();
    expect(getExplorerUrl('   ', 'TESTNET')).toBeNull();
  });
});
