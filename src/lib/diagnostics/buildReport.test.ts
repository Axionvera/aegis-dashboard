import { describe, it, expect } from 'vitest';
import { buildDiagnosticsReport } from './buildReport';
import type { ConfigValidationResult } from '@/config/validate';

const validConfig: ConfigValidationResult = { valid: true, issues: [] };

const errorConfig: ConfigValidationResult = {
  valid: false,
  issues: [
    { field: 'NEXT_PUBLIC_RPC_URL', level: 'error', message: 'Missing RPC URL' },
    { field: 'NEXT_PUBLIC_AEGIS_CONTRACT_ID', level: 'warning', message: 'Contract ID not set' },
  ],
};

describe('buildDiagnosticsReport', () => {
  it('produces a healthy report with ok statuses', () => {
    const { report, cards } = buildDiagnosticsReport(
      {
        walletAddress: 'GABCDEF1234567890ABCDEF',
        walletNetwork: 'TESTNET',
        flags: { newMintFlow: true },
        mockActive: false,
        rpcUrl: 'https://rpc.example.com/v1/abcdef',
        contractId: 'CABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
        sdkVersion: '1.2.3',
      },
      validConfig,
    );

    expect(report.provider).toBe('LiveAegisProvider');
    expect(report.rpc).toContain('rpc.example.com');
    expect(report.contract).toBe('CABC...3456');
    expect(report.wallet).toBe('GABC...CDEF');
    expect(report.network).toBe('TESTNET');
    expect(report.configValidation.valid).toBe(true);
    expect(report.configValidation.errorCount).toBe(0);

    const rpcCard = cards.find((c) => c.title === 'RPC URL');
    expect(rpcCard?.status).toBe('ok');
    const walletCard = cards.find((c) => c.title === 'Wallet Address');
    expect(walletCard?.status).toBe('ok');
  });

  it('produces a failing report with error statuses when config is broken', () => {
    const { report, cards } = buildDiagnosticsReport(
      {
        walletAddress: null,
        walletNetwork: null,
        flags: {},
        mockActive: false,
        rpcUrl: '',
        contractId: '',
        sdkVersion: '1.0.0',
      },
      errorConfig,
    );

    expect(report.configValidation.valid).toBe(false);
    expect(report.configValidation.errorCount).toBe(1);
    expect(report.configValidation.warningCount).toBe(1);
    expect(report.configValidation.fields).toContain('NEXT_PUBLIC_RPC_URL (error)');

    const rpcCard = cards.find((c) => c.title === 'RPC URL');
    expect(rpcCard?.status).toBe('error');
    const configCard = cards.find((c) => c.title === 'Config Validation');
    expect(configCard?.status).toBe('error');
    expect(configCard?.value).toContain('1 error');
    const walletCard = cards.find((c) => c.title === 'Wallet Address');
    expect(walletCard?.status).toBe('unknown');
  });

  it('shows mock warnings when mockActive is true', () => {
    const { report, cards } = buildDiagnosticsReport(
      {
        walletAddress: 'GMOCKWALLET0000000000',
        walletNetwork: null,
        flags: { mockMode: true },
        mockActive: true,
        rpcUrl: '',
        contractId: '',
        sdkVersion: '0.0.0',
      },
      validConfig,
    );

    expect(report.provider).toBe('MockAegisProvider');
    expect(report.rpc).toContain('[MOCK]');
    expect(report.network).toBe('LOCAL_MOCK');
    expect(report.configValidation.valid).toBe(true);
    expect(report.configValidation.errorCount).toBe(0);

    const providerCard = cards.find((c) => c.title === 'Active Provider');
    expect(providerCard?.status).toBe('warning');
    const configCard = cards.find((c) => c.title === 'Config Validation');
    expect(configCard?.status).toBe('warning');
  });
});
