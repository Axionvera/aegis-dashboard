/**
 * Wallet network guard types (Issue #180).
 *
 * The guard sits in front of individual dashboard actions, unlike the
 * app-shell environment check in `src/lib/environment.ts` which blocks whole
 * pages. Both compare the same two values — the wallet's connected network and
 * the dashboard's target network — but the guard decides per action whether a
 * mismatch should block a signature or only warn.
 *
 * IMPORTANT: This is a protocol-level network check. It makes no legal,
 * regulatory, or financial determination about the user or their wallet.
 */

/** Where the wallet stands relative to the dashboard's target network. */
export type NetworkGuardStatus =
  /** Wallet network equals the dashboard target network. */
  | 'match'
  /** Wallet is on a different network than the dashboard targets. */
  | 'mismatch'
  /** Wallet is connected but its network could not be resolved yet. */
  | 'unknown'
  /** No wallet is connected, so no network can be compared. */
  | 'disconnected'
  /** Mock mode is active; no real network is involved. */
  | 'mock';

/** What the calling flow should do with the action it is guarding. */
export type NetworkGuardDecision =
  /** Safe to proceed. */
  | 'allow'
  /** Proceed is permitted, but the user must be told first. */
  | 'warn'
  /** The action must not be submitted. */
  | 'block';

/**
 * How strictly an action reacts to a network problem.
 *
 * - `signing` — the action asks the wallet for a signature and writes to
 *   chain. A wrong network means the transaction lands on the wrong ledger or
 *   fails outright, so these fail closed.
 * - `local` — the action is recorded in the dashboard only and never reaches
 *   the wallet. Network state is still worth surfacing (the record is captured
 *   against a network label) but it must not stop the operator.
 */
export type NetworkGuardSensitivity = 'signing' | 'local';

/** Sensitive dashboard actions that run through the guard. */
export type GuardedActionId =
  | 'transfer'
  | 'mint'
  | 'whitelist-add'
  | 'whitelist-remove'
  | 'compliance-update'
  | 'asset-registration';

export interface GuardedActionPolicy {
  id: GuardedActionId;
  /** Human-readable action name used in guard copy. */
  label: string;
  sensitivity: NetworkGuardSensitivity;
}

export interface NetworkGuardResult {
  status: NetworkGuardStatus;
  decision: NetworkGuardDecision;
  /** Convenience flag: `decision === 'block'`. */
  isBlocked: boolean;
  /** Headline for the guard notice. Empty when the decision is `allow`. */
  title: string;
  /** Plain-language explanation of what the guard found. */
  message: string;
  /** The single next step the user should take. Empty when `allow`. */
  guidance: string;
  /** Human-readable label of the network the dashboard targets. */
  targetNetwork: string;
  /** Human-readable label of the wallet's network, when it is known. */
  walletNetwork?: string;
  /** The policy that produced this decision. */
  action: GuardedActionPolicy;
}

export interface NetworkGuardInput {
  /** Raw value from Freighter's `getNetwork()` — string or object. */
  walletNetwork: unknown;
  isWalletConnected: boolean;
  action: GuardedActionId;
  /** Defaults to the live `isMockModeEnabled()` reading when omitted. */
  isMockMode?: boolean;
}
