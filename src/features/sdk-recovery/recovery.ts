import type {
  ClassifiedSdkError,
  RecoveryAction,
  RecoveryActionId,
  RecoveryPlan,
  RetryPolicy,
  SdkErrorCategory,
} from '@/features/sdk-recovery/types';

/**
 * Maps a classified SDK failure onto the concrete steps a user can take.
 *
 * One plan per category keeps the copy consistent across every flow (transfer,
 * mint, portfolio load, whitelist check) and keeps the "is a retry safe?"
 * decision in one place instead of in each component's catch block.
 */

/** Conservative default: three attempts over roughly two seconds. */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 400,
  maxDelayMs: 4_000,
  jitterRatio: 0.2,
};

/** Throttling deserves a longer, calmer schedule than a transient blip. */
export const RATE_LIMIT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 4,
  baseDelayMs: 1_500,
  maxDelayMs: 15_000,
  jitterRatio: 0.3,
};

const ACTIONS: Record<RecoveryActionId, Omit<RecoveryAction, 'primary'>> = {
  retry: {
    id: 'retry',
    label: 'Try again',
    description: 'Re-run the same request.',
    safeToAutomate: false,
  },
  retry_with_backoff: {
    id: 'retry_with_backoff',
    label: 'Retry',
    description: 'Retry automatically with an increasing delay between attempts.',
    safeToAutomate: true,
  },
  connect_wallet: {
    id: 'connect_wallet',
    label: 'Connect wallet',
    description: 'Unlock or reconnect Freighter, then run the request again.',
    safeToAutomate: false,
  },
  switch_network: {
    id: 'switch_network',
    label: 'Check wallet network',
    description: 'Switch Freighter to the network this dashboard targets.',
    safeToAutomate: false,
  },
  check_explorer: {
    id: 'check_explorer',
    label: 'Check the explorer',
    description: 'Confirm on-chain whether the transaction went through before resubmitting.',
    safeToAutomate: false,
  },
  review_input: {
    id: 'review_input',
    label: 'Edit details',
    description: 'Go back to the form and correct the highlighted values.',
    safeToAutomate: false,
  },
  contact_support: {
    id: 'contact_support',
    label: 'Contact support',
    description: 'Share the diagnostics from this screen with the Aegis team.',
    safeToAutomate: false,
  },
  dismiss: {
    id: 'dismiss',
    label: 'Close',
    description: 'Dismiss this message without retrying.',
    safeToAutomate: false,
  },
};

const buildActions = (ids: RecoveryActionId[]): RecoveryAction[] =>
  ids.map((id, index) => ({ ...ACTIONS[id], primary: index === 0 }));

interface PlanTemplate {
  title: string;
  summary: string;
  actionIds: RecoveryActionId[];
  retry: RetryPolicy | null;
  complianceNote?: string;
}

const TEMPLATES: Record<SdkErrorCategory, PlanTemplate> = {
  wallet_unavailable: {
    title: 'Wallet not available',
    summary:
      'The dashboard could not reach your wallet. It may be locked, disconnected, or not installed. Nothing was submitted.',
    actionIds: ['connect_wallet', 'retry', 'dismiss'],
    retry: null,
  },
  wallet_rejected: {
    title: 'Signature declined',
    summary:
      'The signature request was declined in your wallet, so nothing was submitted to the network.',
    actionIds: ['retry', 'dismiss'],
    retry: null,
  },
  network_mismatch: {
    title: 'Wrong wallet network',
    summary:
      'Your wallet is connected to a different network than this dashboard targets. Nothing was submitted.',
    actionIds: ['switch_network', 'retry', 'dismiss'],
    retry: null,
  },
  network_unreachable: {
    title: 'Network unreachable',
    summary:
      'We could not reach the Aegis RPC endpoint. This is usually a connectivity issue and clears on its own.',
    actionIds: ['retry_with_backoff', 'check_explorer', 'contact_support'],
    retry: DEFAULT_RETRY_POLICY,
  },
  timeout: {
    title: 'The request timed out',
    summary:
      'The request did not complete in time. It may still have reached the network, so check before resubmitting.',
    actionIds: ['check_explorer', 'retry_with_backoff', 'contact_support'],
    retry: DEFAULT_RETRY_POLICY,
  },
  rate_limited: {
    title: 'Too many requests',
    summary:
      'The endpoint is throttling requests from this client. Waiting a few seconds usually resolves it.',
    actionIds: ['retry_with_backoff', 'dismiss'],
    retry: RATE_LIMIT_RETRY_POLICY,
  },
  compliance_blocked: {
    title: 'Blocked by compliance rules',
    summary:
      'The protocol refused this operation under the compliance rules configured for this asset or address. Retrying without changing anything will produce the same result.',
    actionIds: ['review_input', 'contact_support', 'dismiss'],
    retry: null,
    complianceNote:
      'This reflects the protocol-level rules returned by the SDK. It is not legal or financial advice, and it is not a statement about your eligibility outside this protocol.',
  },
  insufficient_funds: {
    title: 'Insufficient balance',
    summary:
      'The account does not hold enough balance or reserve to cover this operation. Nothing was submitted.',
    actionIds: ['review_input', 'dismiss'],
    retry: null,
  },
  invalid_input: {
    title: 'The request was rejected as invalid',
    summary:
      'One or more values in the request were rejected before submission. Correct them and try again.',
    actionIds: ['review_input', 'dismiss'],
    retry: null,
  },
  indeterminate: {
    title: 'Outcome could not be confirmed',
    summary:
      'The request reached the network but we could not read back its result. Do not resubmit until you have checked the explorer — the original may still confirm.',
    actionIds: ['check_explorer', 'contact_support', 'dismiss'],
    retry: null,
  },
  unknown: {
    title: 'Something went wrong',
    summary:
      'We could not determine what happened. Treat this as unconfirmed: check the explorer before resubmitting.',
    actionIds: ['check_explorer', 'retry', 'contact_support'],
    retry: null,
  },
};

/**
 * Build the recovery plan for a classified error.
 *
 * The plan is pure data — the caller decides what each action id does in its
 * own context (a transfer modal retries the transfer; the portfolio page
 * refetches). Actions that would resubmit a possibly-live transaction are never
 * marked `safeToAutomate`, and `reuseIdempotencyKey` tells the caller when a
 * retry must carry the original key so a duplicate cannot be created.
 */
export const buildRecoveryPlan = (error: ClassifiedSdkError): RecoveryPlan => {
  const template = TEMPLATES[error.category];
  const actionIds = [...template.actionIds];

  // A hash means there is something concrete to look up, so surface the
  // explorer even for categories that normally would not offer it.
  if (error.txHash && !actionIds.includes('check_explorer')) {
    actionIds.splice(actionIds.length > 1 ? 1 : 0, 0, 'check_explorer');
  }

  const actions = buildActions(actionIds);
  const reuseIdempotencyKey = error.sideEffectRisk !== 'none';

  return {
    category: error.category,
    title: template.title,
    summary: template.summary,
    actions: reuseIdempotencyKey
      ? // Without a de-duplicated retry we must not let the UI auto-fire a
        // request that might double-apply.
        actions.map((action) =>
          action.id === 'retry_with_backoff' ? { ...action, safeToAutomate: false } : action,
        )
      : actions,
    retry: template.retry,
    reuseIdempotencyKey,
    complianceNote: template.complianceNote,
  };
};

/** Convenience: the plan's emphasised action, or `null` if a plan is empty. */
export const primaryAction = (plan: RecoveryPlan): RecoveryAction | null =>
  plan.actions.find((action) => action.primary) ?? plan.actions[0] ?? null;
