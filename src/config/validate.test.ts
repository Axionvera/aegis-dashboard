import { describe, it, expect, beforeEach } from 'vitest';
import { validateDashboardConfig } from './validate';

const ORIGINAL_ENV = process.env;

const VALID_CONTRACT_ID = 'C' + 'A'.repeat(55);

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
  process.env.NEXT_PUBLIC_RPC_URL = 'https://soroban-testnet.stellar.org';
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
  process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID = VALID_CONTRACT_ID;
});

describe('validateDashboardConfig', () => {
  it('is valid when all fields are well-formed', () => {
    const result = validateDashboardConfig();
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('skips all validation when mock mode is enabled, even with missing config', () => {
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    delete process.env.NEXT_PUBLIC_RPC_URL;
    delete process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
    delete process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID;

    const result = validateDashboardConfig();
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  describe('RPC URL', () => {
    it('errors when missing', () => {
      delete process.env.NEXT_PUBLIC_RPC_URL;
      const result = validateDashboardConfig();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ field: 'NEXT_PUBLIC_RPC_URL', level: 'error' }),
      );
    });

    it('errors when not a valid URL', () => {
      process.env.NEXT_PUBLIC_RPC_URL = 'not-a-url';
      const result = validateDashboardConfig();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ field: 'NEXT_PUBLIC_RPC_URL', level: 'error' }),
      );
    });

    it('warns (but does not invalidate) on non-HTTPS remote URLs', () => {
      process.env.NEXT_PUBLIC_RPC_URL = 'http://soroban-testnet.stellar.org';
      const result = validateDashboardConfig();
      expect(result.valid).toBe(true);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ field: 'NEXT_PUBLIC_RPC_URL', level: 'warning' }),
      );
    });

    it('allows plain HTTP on localhost', () => {
      process.env.NEXT_PUBLIC_RPC_URL = 'http://localhost:8000/soroban/rpc';
      const result = validateDashboardConfig();
      expect(result.issues.filter((i) => i.field === 'NEXT_PUBLIC_RPC_URL')).toHaveLength(0);
    });
  });

  describe('Network passphrase', () => {
    it('errors when missing', () => {
      delete process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
      const result = validateDashboardConfig();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ field: 'NEXT_PUBLIC_NETWORK_PASSPHRASE', level: 'error' }),
      );
    });

    it('warns (but does not invalidate) on an unrecognized passphrase', () => {
      process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Standalone Network ; February 2017';
      const result = validateDashboardConfig();
      expect(result.valid).toBe(true);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ field: 'NEXT_PUBLIC_NETWORK_PASSPHRASE', level: 'warning' }),
      );
    });

    it('accepts the known PUBLIC passphrase with no issues', () => {
      process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
      const result = validateDashboardConfig();
      expect(result.issues.filter((i) => i.field === 'NEXT_PUBLIC_NETWORK_PASSPHRASE')).toHaveLength(0);
    });
  });

  describe('Contract ID', () => {
    it('errors when missing', () => {
      delete process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID;
      const result = validateDashboardConfig();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ field: 'NEXT_PUBLIC_AEGIS_CONTRACT_ID', level: 'error' }),
      );
    });

    it('errors on the placeholder value from .env.example', () => {
      process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID = 'CABC123...';
      const result = validateDashboardConfig();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ field: 'NEXT_PUBLIC_AEGIS_CONTRACT_ID', level: 'error' }),
      );
    });

    it('errors when too short', () => {
      process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID = 'CSHORT';
      const result = validateDashboardConfig();
      expect(result.valid).toBe(false);
    });

    it('errors when it does not start with C', () => {
      process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID = 'G' + 'A'.repeat(55);
      const result = validateDashboardConfig();
      expect(result.valid).toBe(false);
    });

    it('accepts a well-formed 56-character contract ID', () => {
      const result = validateDashboardConfig();
      expect(result.issues.filter((i) => i.field === 'NEXT_PUBLIC_AEGIS_CONTRACT_ID')).toHaveLength(0);
    });
  });

  it('reports multiple issues at once rather than stopping at the first', () => {
    delete process.env.NEXT_PUBLIC_RPC_URL;
    delete process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
    delete process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID;

    const result = validateDashboardConfig();
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(3);
  });
});