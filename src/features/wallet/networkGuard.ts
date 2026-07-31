/**
 * Pure evaluation logic for the wallet network guard (Issue #180).
 *
 * Reuses the passphrase resolution and labelling helpers from
 * `src/lib/environment.ts` so the guard and the app-shell blocking screen can
 * never disagree about which network the wallet is on.
 */

import { isMockModeEnabled } from '@/config/mockMode';
import { formatNetworkLabel, getTargetNetwork, resolvePassphrase } from '@/lib/environment';
import type {
  GuardedActionId,
  GuardedActionPolicy,
  NetworkGuardDecision,
  NetworkGuardInput,
  NetworkGuardResult,
  NetworkGuardStatus,
} from './types';

/**
 * Disclaimer that must accompany any surface rendering a guard result. Kept
 * here so the wording stays identical across every guarded flow.
 */
export const NETWORK_GUARD_DISCLAIMER =
  'This is a protocol-level network check. It does not make a legal, regulatory, or ' +
  'financial determination about your wallet or jurisdiction.';

export const GUARDED_ACTIONS: Record<GuardedActionId, GuardedActionPolicy> = {
  transfer: { id: 'transfer', label: 'Transfer', sensitivity: 'signing' },
  mint: { id: 'mint', label: 'Mint', sensitivity: 'signing' },
  'whitelist-add': { id: 'whitelist-add', label: 'Whitelist addition', sensitivity: 'signing' },
  'whitelist-remove': { id: 'whitelist-remove', label: 'Whitelist removal', sensitivity: 'signing' },
  'compliance-update': {
    id: 'compliance-update',
    label: 'Compliance status update',
    sensitivity: 'local',
  },
  'asset-registration': {
    id: 'asset-registration',
    label: 'Asset registration',
    sensitivity: 'local',
  },
};

/**
 * Decision matrix.
 *
 * Signing actions fail closed on anything other than a confirmed match: an
 * unresolved network is treated the same as a wrong one, because a signature
 * sent to an unverified network cannot be recalled. Local actions never block,
 * since nothing reaches the wallet, but a mismatch is still surfaced so the
 * operator knows which network the record will be attributed to.
 */
const DECISIONS: Record<'signing' | 'local', Record<NetworkGuardStatus, NetworkGuardDecision>> = {
  signing: {
    match: 'allow',
    mismatch: 'block',
    unknown: 'block',
    disconnected: 'block',
    mock: 'allow',
  },
  local: {
    match: 'allow',
    mismatch: 'warn',
    unknown: 'allow',
    disconnected: 'allow',
    mock: 'allow',
  },
};

function resolveStatus(
  walletNetwork: unknown,
  isWalletConnected: boolean,
  isMockMode: boolean,
  target: string,
): { status: NetworkGuardStatus; passphrase: string | null } {
  if (isMockMode) return { status: 'mock', passphrase: null };
  if (!isWalletConnected) return { status: 'disconnected', passphrase: null };

  const passphrase = resolvePassphrase(walletNetwork);
  if (!passphrase) return { status: 'unknown', passphrase: null };

  return { status: passphrase === target ? 'match' : 'mismatch', passphrase };
}

interface CopyInput {
  status: NetworkGuardStatus;
  decision: NetworkGuardDecision;
  action: GuardedActionPolicy;
  targetLabel: string;
  walletLabel?: string;
}

function buildCopy({ status, decision, action, targetLabel, walletLabel }: CopyInput): {
  title: string;
  message: string;
  guidance: string;
} {
  const lowerLabel = action.label.toLowerCase();

  switch (status) {
    case 'mismatch':
      return decision === 'block'
        ? {
            title: 'Wrong wallet network',
            message:
              `Your wallet is connected to ${walletLabel}, but this dashboard targets ` +
              `${targetLabel}. This ${lowerLabel} was not submitted.`,
            guidance: `Switch Freighter to ${targetLabel}, then reopen this action.`,
          }
        : {
            title: 'Wallet is on a different network',
            message:
              `Your wallet is connected to ${walletLabel} while this dashboard targets ` +
              `${targetLabel}. This ${lowerLabel} is recorded in the dashboard only and is ` +
              'not submitted to the network, so it can still proceed.',
            guidance: `Switch Freighter to ${targetLabel} if you expected an on-chain result.`,
          };

    case 'unknown':
      return {
        title: 'Wallet network not confirmed',
        message:
          `The dashboard could not read which network your wallet is on, so it cannot ` +
          `confirm this ${lowerLabel} would reach ${targetLabel}.`,
        guidance: 'Unlock Freighter and reconnect your wallet, then try again.',
      };

    case 'disconnected':
      return {
        title: 'Wallet not connected',
        message: `Connect a wallet on ${targetLabel} to sign this ${lowerLabel}.`,
        guidance: `Connect Freighter on ${targetLabel}.`,
      };

    default:
      return { title: '', message: '', guidance: '' };
  }
}

/**
 * Evaluate whether a specific sensitive action may proceed on the wallet's
 * current network.
 */
export function evaluateNetworkGuard({
  walletNetwork,
  isWalletConnected,
  action,
  isMockMode = isMockModeEnabled(),
}: NetworkGuardInput): NetworkGuardResult {
  const policy = GUARDED_ACTIONS[action];
  const target = getTargetNetwork();
  const targetLabel = formatNetworkLabel(target);

  const { status, passphrase } = resolveStatus(walletNetwork, isWalletConnected, isMockMode, target);
  const walletLabel = passphrase ? formatNetworkLabel(passphrase) : undefined;
  const decision = DECISIONS[policy.sensitivity][status];
  const copy = buildCopy({ status, decision, action: policy, targetLabel, walletLabel });

  return {
    status,
    decision,
    isBlocked: decision === 'block',
    ...copy,
    targetNetwork: targetLabel,
    walletNetwork: walletLabel,
    action: policy,
  };
}
