import { describe, expect, it } from 'vitest';
import { evaluateNetworkGuard, GUARDED_ACTIONS } from './networkGuard';
import { NETWORK_GUARD_FIXTURES, PUBLIC_PASSPHRASE, TESTNET_PASSPHRASE } from './fixtures';
import type { GuardedActionId } from './types';

const onPublic = { networkPassphrase: PUBLIC_PASSPHRASE };
const onTestnet = { networkPassphrase: TESTNET_PASSPHRASE };

function guard(action: GuardedActionId, walletNetwork: unknown, isWalletConnected = true) {
  return evaluateNetworkGuard({
    action,
    walletNetwork,
    isWalletConnected,
    isMockMode: false,
  });
}

describe('evaluateNetworkGuard', () => {
  it.each(NETWORK_GUARD_FIXTURES)('$label', (fixture) => {
    const result = evaluateNetworkGuard({
      walletNetwork: fixture.walletNetwork,
      isWalletConnected: fixture.isWalletConnected,
      action: fixture.action,
      isMockMode: fixture.isMockMode,
    });

    expect(result.status).toBe(fixture.expectedStatus);
    expect(result.decision).toBe(fixture.expectedDecision);
    expect(result.isBlocked).toBe(fixture.expectedDecision === 'block');
  });

  it('blocks a signing action on the wrong network and names both networks', () => {
    const result = guard('transfer', onPublic);

    expect(result.isBlocked).toBe(true);
    expect(result.walletNetwork).toBe('Stellar Mainnet (PUBLIC)');
    expect(result.targetNetwork).toBe('Stellar Testnet (TESTNET)');
    expect(result.message).toContain('was not submitted');
    expect(result.guidance).toContain('Switch Freighter');
  });

  it('warns but still allows a local action on the wrong network', () => {
    const result = guard('compliance-update', onPublic);

    expect(result.decision).toBe('warn');
    expect(result.isBlocked).toBe(false);
    expect(result.message).toContain('not submitted to the network');
  });

  it('fails closed for signing when the wallet network cannot be read', () => {
    expect(guard('mint', {}).isBlocked).toBe(true);
    expect(guard('mint', null).isBlocked).toBe(true);
    expect(guard('mint', undefined).status).toBe('unknown');
  });

  it('reports a disconnected wallet rather than a mismatch', () => {
    const result = guard('transfer', null, false);

    expect(result.status).toBe('disconnected');
    expect(result.walletNetwork).toBeUndefined();
    expect(result.title).toBe('Wallet not connected');
  });

  it('skips the comparison entirely in mock mode', () => {
    const result = evaluateNetworkGuard({
      action: 'transfer',
      walletNetwork: 'LOCAL_MOCK',
      isWalletConnected: true,
      isMockMode: true,
    });

    expect(result.status).toBe('mock');
    expect(result.decision).toBe('allow');
    expect(result.title).toBe('');
  });

  it('accepts the short network name Freighter sometimes returns', () => {
    expect(guard('transfer', 'TESTNET').status).toBe('match');
    expect(guard('transfer', { network: 'TESTNET' }).status).toBe('match');
  });

  it('produces no copy when the action is allowed', () => {
    const result = guard('transfer', onTestnet);

    expect(result.decision).toBe('allow');
    expect(result.title).toBe('');
    expect(result.message).toBe('');
    expect(result.guidance).toBe('');
  });

  it('names the guarded action in its copy', () => {
    expect(guard('whitelist-add', onPublic).message).toContain('whitelist addition');
    expect(guard('whitelist-remove', onPublic).message).toContain('whitelist removal');
  });

  it('treats an unrecognised passphrase as a mismatch and shows it verbatim', () => {
    const result = guard('transfer', { networkPassphrase: 'Standalone Network ; February 2017' });

    expect(result.status).toBe('mismatch');
    expect(result.walletNetwork).toBe('Standalone Network ; February 2017');
  });

  it('blocks every signing action and never blocks a local one', () => {
    for (const policy of Object.values(GUARDED_ACTIONS)) {
      const result = guard(policy.id, onPublic);

      expect(result.decision).toBe(policy.sensitivity === 'signing' ? 'block' : 'warn');
    }
  });
});
