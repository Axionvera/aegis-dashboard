/**
 * Dashboard configuration validation (Issue #8).
 *
 * Validates the shape of the environment variables that tell the dashboard
 * which network, RPC endpoint, and contract to talk to. The goal is to fail
 * loudly and clearly at startup when a variable is missing or malformed,
 * instead of surfacing as a confusing runtime error deep inside an SDK call
 * or — worse — silently sending signed actions to the wrong contract.
 *
 * Scope: this module only checks *shape* (is it a URL? is it contract-ID
 * shaped?). It does not verify that the RPC endpoint is reachable or that
 * the contract is actually deployed on-chain — that's a runtime/network
 * concern, not a config concern.
 *
 * See docs/config-validation.md for the full guardrail write-up.
 */

import { isMockModeEnabled } from './mockMode';

export type ConfigIssueLevel = 'error' | 'warning';

export interface ConfigIssue {
  /** The env var this issue relates to, e.g. "NEXT_PUBLIC_RPC_URL". */
  field: string;
  /** "error" blocks the dashboard; "warning" is surfaced but non-blocking. */
  level: ConfigIssueLevel;
  /** Human-readable, non-sensitive explanation (never includes the raw value). */
  message: string;
}

export interface ConfigValidationResult {
  /** False when at least one "error"-level issue is present. */
  valid: boolean;
  issues: ConfigIssue[];
}

/**
 * Soroban/Stellar contract IDs are 56-character strkey-encoded strings that
 * start with "C" (StrKey version byte for CONTRACT), using base32 alphabet
 * [A-Z2-7]. This is a shape check only — it does not verify the checksum.
 */
const CONTRACT_ID_PATTERN = /^C[A-Z2-7]{55}$/;

const KNOWN_PASSPHRASES = new Set([
  'Public Global Stellar Network ; September 2015',
  'Test SDF Network ; September 2015',
]);

function validateRpcUrl(rawUrl: string | undefined): ConfigIssue[] {
  const field = 'NEXT_PUBLIC_RPC_URL';

  if (!rawUrl) {
    return [{ field, level: 'error', message: 'RPC URL is not set.' }];
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return [{ field, level: 'error', message: 'RPC URL is not a valid URL.' }];
  }

  const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  if (parsed.protocol !== 'https:' && !isLocalHost) {
    return [
      {
        field,
        level: 'warning',
        message: 'RPC URL does not use HTTPS. Non-local RPC endpoints should always be HTTPS.',
      },
    ];
  }

  return [];
}

function validateNetworkPassphrase(passphrase: string | undefined): ConfigIssue[] {
  const field = 'NEXT_PUBLIC_NETWORK_PASSPHRASE';

  if (!passphrase) {
    return [{ field, level: 'error', message: 'Network passphrase is not set.' }];
  }

  if (!KNOWN_PASSPHRASES.has(passphrase)) {
    return [
      {
        field,
        level: 'warning',
        message:
          'Passphrase is not one of the known Stellar PUBLIC/TESTNET passphrases. ' +
          'Confirm this is intentional (e.g. a custom standalone network) before deploying.',
      },
    ];
  }

  return [];
}

function validateContractId(contractId: string | undefined): ConfigIssue[] {
  const field = 'NEXT_PUBLIC_AEGIS_CONTRACT_ID';

  if (!contractId) {
    return [{ field, level: 'error', message: 'Contract ID is not set.' }];
  }

  if (!CONTRACT_ID_PATTERN.test(contractId)) {
    return [
      {
        field,
        level: 'error',
        message: 'Contract ID is not a valid Soroban contract ID (expected 56 characters, starting with "C").',
      },
    ];
  }

  return [];
}

/**
 * Validate the dashboard's own configuration env vars.
 *
 * When mock mode is active, RPC URL / contract ID / passphrase are allowed to
 * be missing or placeholder values since no real network calls are made, so
 * validation is skipped entirely and this always reports valid.
 */
export function validateDashboardConfig(): ConfigValidationResult {
  if (isMockModeEnabled()) {
    return { valid: true, issues: [] };
  }

  const issues: ConfigIssue[] = [
    ...validateRpcUrl(process.env.NEXT_PUBLIC_RPC_URL),
    ...validateNetworkPassphrase(process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE),
    ...validateContractId(process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID),
  ];

  const valid = !issues.some((issue) => issue.level === 'error');

  return { valid, issues };
}