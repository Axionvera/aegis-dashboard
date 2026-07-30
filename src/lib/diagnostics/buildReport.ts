/**
 * Diagnostics report builder — pure function that assembles a redacted,
 * copyable diagnostics report from runtime inputs.
 *
 * Extracted from DiagnosticsPanel so the report logic is unit-testable
 * without rendering React components or mocking hooks. The panel calls
 * this and renders the result; tests call this directly with fixtures.
 *
 * Sensitive values (RPC URL paths, contract IDs, wallet addresses) are
 * always redacted via the shared redact helpers — the report is safe to
 * paste into a support channel.
 */

import { redactUrl, redactContractId } from './redact';
import { validateDashboardConfig, type ConfigValidationResult } from '@/config/validate';

export type DiagnosticsStatus = 'ok' | 'warning' | 'error' | 'unknown';

export interface DiagnosticsInput {
  /** Wallet address from Freighter, or null when not connected. */
  walletAddress: string | null;
  /** Wallet network passphrase/label, or null when not connected. */
  walletNetwork: string | null;
  /** Feature flags snapshot. */
  flags: Record<string, unknown>;
  /** True when the mock provider is active. */
  mockActive: boolean;
  /** Raw RPC URL from env (will be redacted). */
  rpcUrl: string;
  /** Raw contract ID from env (will be redacted). */
  contractId: string;
  /** SDK version string. */
  sdkVersion: string;
}

export interface DiagnosticsReport {
  timestamp: string;
  sdkVersion: string;
  rpc: string;
  contract: string;
  wallet: string;
  network: string;
  configValidation: {
    valid: boolean;
    errorCount: number;
    warningCount: number;
    fields: string[];
  };
  flags: Record<string, unknown>;
  provider: string;
}

export interface DiagnosticsCard {
  title: string;
  value: string;
  status: DiagnosticsStatus;
}

export interface DiagnosticsReportResult {
  report: DiagnosticsReport;
  cards: DiagnosticsCard[];
}

/**
 * Build a redacted diagnostics report and the status cards derived from it.
 *
 * @param input Runtime inputs (wallet, env, flags, mock state).
 * @param configResult Optional pre-computed config validation result. When
 *   omitted, `validateDashboardConfig()` is called. Pass a fixture in tests
 *   to avoid touching `process.env`.
 */
export function buildDiagnosticsReport(
  input: DiagnosticsInput,
  configResult?: ConfigValidationResult,
): DiagnosticsReportResult {
  const { walletAddress, walletNetwork, flags, mockActive, rpcUrl, contractId, sdkVersion } = input;

  const config = configResult ?? validateDashboardConfig();
  const errorCount = config.issues.filter((i) => i.level === 'error').length;
  const warningCount = config.issues.filter((i) => i.level === 'warning').length;

  const redactedRpc = redactUrl(rpcUrl);
  const redactedContract = redactContractId(contractId);
  const redactedWallet = walletAddress ? redactContractId(walletAddress) : 'Not connected';

  const report: DiagnosticsReport = {
    timestamp: new Date().toISOString(),
    sdkVersion: mockActive ? '[MOCK] v0.0.0-local' : sdkVersion,
    rpc: mockActive ? '[MOCK] Not connected — mock provider active' : redactedRpc,
    contract: mockActive ? '[MOCK] Not deployed — mock provider active' : redactedContract,
    wallet: redactedWallet,
    network: mockActive ? 'LOCAL_MOCK' : walletNetwork || 'Not connected',
    configValidation: {
      valid: mockActive ? true : config.valid,
      errorCount: mockActive ? 0 : errorCount,
      warningCount: mockActive ? 0 : warningCount,
      fields: mockActive ? [] : config.issues.map((i) => `${i.field} (${i.level})`),
    },
    flags,
    provider: mockActive ? 'MockAegisProvider' : 'LiveAegisProvider',
  };

  const cards: DiagnosticsCard[] = [
    {
      title: 'Active Provider',
      value: report.provider,
      status: mockActive ? 'warning' : 'ok',
    },
    {
      title: 'Config Validation',
      value:
        mockActive
          ? '[MOCK] Skipped — mock provider active'
          : errorCount > 0
            ? `${errorCount} error(s), ${warningCount} warning(s)`
            : warningCount > 0
              ? `Valid — ${warningCount} warning(s)`
              : 'Valid',
      status: mockActive ? 'warning' : errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'ok',
    },
    {
      title: 'RPC URL',
      value: mockActive ? '[MOCK] Not connected' : redactedRpc,
      status: mockActive ? 'warning' : rpcUrl ? 'ok' : 'error',
    },
    {
      title: 'Contract ID',
      value: mockActive ? '[MOCK] Not deployed' : redactedContract,
      status: mockActive ? 'warning' : contractId ? 'ok' : 'error',
    },
    {
      title: 'SDK Version',
      value: report.sdkVersion,
      status: 'warning',
    },
    {
      title: 'Wallet Address',
      value: redactedWallet,
      status: walletAddress ? 'ok' : 'unknown',
    },
    {
      title: 'Wallet Network',
      value: report.network,
      status: mockActive ? 'warning' : walletNetwork ? 'ok' : 'unknown',
    },
  ];

  return { report, cards };
}
