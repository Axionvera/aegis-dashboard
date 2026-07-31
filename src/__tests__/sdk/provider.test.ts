/**
 * Tests for the SDK provider factory (src/lib/sdk/index.ts) and
 * MockAegisProvider (src/lib/sdk/MockAegisProvider.ts).
 *
 * The live provider is NOT tested here because it delegates to client.ts
 * stubs that will be replaced once the real SDK is published.
 */

import { _resetProvider, getAegisProvider, isProviderMocked } from '../../lib/sdk';
import { MockAegisProvider } from '../../lib/sdk/MockAegisProvider';
import { LiveAegisProvider } from '../../lib/sdk/LiveAegisProvider';

// Ensure the provider singleton is reset between tests.
beforeEach(() => {
  _resetProvider();
  delete process.env.NEXT_PUBLIC_MOCK_MODE;
});

afterEach(() => {
  _resetProvider();
  delete process.env.NEXT_PUBLIC_MOCK_MODE;
});

describe('getAegisProvider', () => {
  it('returns a LiveAegisProvider when NEXT_PUBLIC_MOCK_MODE is not set', () => {
    const provider = getAegisProvider();
    expect(provider).toBeInstanceOf(LiveAegisProvider);
  });

  it('returns a LiveAegisProvider when NEXT_PUBLIC_MOCK_MODE is "false"', () => {
    process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
    const provider = getAegisProvider();
    expect(provider).toBeInstanceOf(LiveAegisProvider);
  });

  it('returns a MockAegisProvider when NEXT_PUBLIC_MOCK_MODE is "true"', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    // assertMockModeSafe requires NODE_ENV === 'development' when mock mode is on.
    (process.env as Record<string, string>).NODE_ENV = 'development';
    try {
      const provider = getAegisProvider();
      expect(provider).toBeInstanceOf(MockAegisProvider);
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalNodeEnv ?? 'test';
    }
  });

  it('returns the same singleton instance on repeated calls', () => {
    const first = getAegisProvider();
    const second = getAegisProvider();
    expect(first).toBe(second);
  });
});

describe('isProviderMocked', () => {
  it('returns false when the live provider is active', () => {
    expect(isProviderMocked()).toBe(false);
  });

  it('returns true when the mock provider is active', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    // assertMockModeSafe requires NODE_ENV === 'development' when mock mode is on.
    (process.env as Record<string, string>).NODE_ENV = 'development';
    try {
      expect(isProviderMocked()).toBe(true);
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalNodeEnv ?? 'test';
    }
  });
});

describe('MockAegisProvider', () => {
  let provider: MockAegisProvider;

  beforeEach(() => {
    provider = new MockAegisProvider();
  });

  it('has a providerName of "MockAegisProvider"', () => {
    expect(provider.providerName).toBe('MockAegisProvider');
  });

  it('getPortfolio throws when no address is provided', async () => {
    await expect(provider.getPortfolio('')).rejects.toThrow('[MOCK]');
  });

  it('getPortfolio returns a portfolio with the requested address', async () => {
    const address = 'GCFXMOCKTEST00000000000000000000000000000000000000000000000';
    const result = await provider.getPortfolio(address);
    expect(result.investorAddress).toBe(address);
    expect(Array.isArray(result.assets)).toBe(true);
    expect(result.assets.length).toBeGreaterThan(0);
    expect(result.fetchedAt).toBeTruthy();
  });

  it('getPortfolio fixture includes all required asset fields', async () => {
    const { assets } = await provider.getPortfolio('GCFXMOCK00000000000000000000000000000000000000000000000000');
    for (const asset of assets) {
      expect(asset).toHaveProperty('id');
      expect(asset).toHaveProperty('ticker');
      expect(asset).toHaveProperty('balance');
      expect(asset).toHaveProperty('compliance');
      expect(asset).toHaveProperty('transferEligibility');
      expect(typeof asset.isDataAvailable).toBe('boolean');
    }
  });

  it('checkWhitelist returns true for a long G-address', async () => {
    const longGAddress = 'G' + 'A'.repeat(54); // 55 chars total
    expect(await provider.checkWhitelist(longGAddress)).toBe(true);
  });

  it('checkWhitelist returns false for a short address', async () => {
    expect(await provider.checkWhitelist('GABC')).toBe(false);
  });

  it('getAddressCompliance returns fixture status for known addresses', async () => {
    const record = await provider.getAddressCompliance(
      'GCFXCOMPREVOKED000000000000000000000000000000000000000',
    );
    expect(record.status).toBe('revoked');
    expect(record.address).toContain('REVOKED');
  });

  it('getAddressCompliance falls back to approved for long G-addresses', async () => {
    const address = 'G' + 'A'.repeat(54);
    const record = await provider.getAddressCompliance(address);
    expect(record.status).toBe('approved');
  });

  it('getAddressCompliance returns unknown for unsupported addresses', async () => {
    const record = await provider.getAddressCompliance('INVALID');
    expect(record.status).toBe('unknown');
  });

  it('transfer returns SUCCESS for a standard amount', async () => {
    const result = await provider.transfer('GCFXTEST', 100);
    expect(result.status).toBe('SUCCESS');
  });

  it('transfer returns FAILED for amount 0.01', async () => {
    const result = await provider.transfer('GCFXTEST', 0.01);
    expect(result.status).toBe('FAILED');
  });

  it('transfer returns PENDING for amount 0.02', async () => {
    const result = await provider.transfer('GCFXTEST', 0.02);
    expect(result.status).toBe('PENDING');
  });

  it('mint returns SUCCESS for a standard amount', async () => {
    const result = await provider.mint('GCFXTEST', 500);
    expect(result.status).toBe('SUCCESS');
  });

  it('mint returns FAILED for amount 0.01', async () => {
    const result = await provider.mint('GCFXTEST', 0.01);
    expect(result.status).toBe('FAILED');
  });

  it('phase callbacks are called during transfer', async () => {
    const phases: string[] = [];
    await provider.transfer('GCFXTEST', 100, (phase) => phases.push(phase));
    expect(phases).toContain('signing');
    expect(phases).toContain('pending');
  });

  it('phase callbacks are called during mint', async () => {
    const phases: string[] = [];
    await provider.mint('GCFXTEST', 100, (phase) => phases.push(phase));
    expect(phases).toContain('signing');
    expect(phases).toContain('pending');
  });

  it('listWhitelist returns the fixture entries', async () => {
    const entries = await provider.listWhitelist();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toHaveProperty('address');
    expect(entries[0]).toHaveProperty('status');
  });

  it('listWhitelist returns copies, not internal references', async () => {
    const first = await provider.listWhitelist();
    first[0].status = 'revoked';
    const second = await provider.listWhitelist();
    expect(second[0].status).not.toBe('revoked');
  });

  it('addToWhitelist throws when no address is provided', async () => {
    await expect(provider.addToWhitelist('', 'GCFXADMIN')).rejects.toThrow('[MOCK]');
  });

  it('addToWhitelist adds a new entry with status whitelisted', async () => {
    const address = 'GCFXNEWUSER000000000000000000000000000000000000000000';
    const outcome = await provider.addToWhitelist(address, 'GCFXADMIN');
    expect(outcome.status).toBe('SUCCESS');

    const entries = await provider.listWhitelist();
    const entry = entries.find((e) => e.address === address);
    expect(entry?.status).toBe('whitelisted');
    expect(entry?.updatedBy).toBe('GCFXADMIN');
  });

  it('removeFromWhitelist throws when no address is provided', async () => {
    await expect(provider.removeFromWhitelist('', 'GCFXADMIN')).rejects.toThrow('[MOCK]');
  });

  it('removeFromWhitelist marks an existing entry as revoked', async () => {
    const entries = await provider.listWhitelist();
    const whitelisted = entries.find((e) => e.status === 'whitelisted');
    expect(whitelisted).toBeDefined();

    await provider.removeFromWhitelist(whitelisted!.address, 'GCFXADMIN');

    const updated = await provider.listWhitelist();
    const entry = updated.find((e) => e.address === whitelisted!.address);
    expect(entry?.status).toBe('revoked');
    expect(entry?.updatedBy).toBe('GCFXADMIN');
  });

  it('phase callbacks are called during addToWhitelist', async () => {
    const phases: string[] = [];
    await provider.addToWhitelist('GCFXTEST', 'GCFXADMIN', (phase) => phases.push(phase));
    expect(phases).toContain('signing');
    expect(phases).toContain('pending');
  });
});
