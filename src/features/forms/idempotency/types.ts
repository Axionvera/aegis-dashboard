/**
 * Shared vocabulary for the form submission idempotency guard (issue #39).
 *
 * The dashboard signs value-moving operations (transfer, mint, compliance
 * updates). A double-click, an impatient retry, or a component remount must not
 * turn one intent into two submissions. The guard makes every submission carry
 * a key derived from *what is being submitted*, and refuses a second submission
 * for the same key while the first is unresolved.
 *
 * Scope note: this is a client-side guard. It removes duplicates originating in
 * this browser tab. It is not a substitute for server- or contract-side
 * de-duplication, which remains the authoritative protection against replay.
 */

/** Lifecycle of one keyed submission. */
export type SubmissionState = 'in_flight' | 'succeeded' | 'failed';

/** What the guard decided about a submission attempt. */
export type GuardDecision =
  /** No conflicting entry: the caller should submit. */
  | 'proceed'
  /** An identical submission is still running: the caller must not submit. */
  | 'duplicate_in_flight'
  /** An identical submission already succeeded inside the replay window. */
  | 'replay_result'
  /** A previous attempt failed; submitting again is allowed. */
  | 'retry_after_failure'
  /** The previous attempt is older than the in-flight TTL and was abandoned. */
  | 'proceed_after_stale';

export interface SubmissionEntry<TResult = unknown> {
  key: string;
  state: SubmissionState;
  /** Epoch ms of the first attempt for this key. */
  startedAt: number;
  /** Epoch ms the entry reached a terminal state. */
  settledAt?: number;
  /** How many times `begin` returned `proceed`-like decisions for this key. */
  attempts: number;
  /** Cached result of a successful submission, replayed on duplicates. */
  result?: TResult;
  /** Reason recorded when the submission failed. */
  error?: unknown;
}

export interface GuardVerdict<TResult = unknown> {
  decision: GuardDecision;
  key: string;
  /** True only for `proceed`, `proceed_after_stale` and `retry_after_failure`. */
  allowed: boolean;
  /** The entry the decision was based on, when one existed. */
  entry?: SubmissionEntry<TResult>;
  /** User-facing explanation for blocked decisions. */
  message?: string;
}

export interface IdempotencyLedgerOptions {
  /**
   * How long an unresolved submission blocks duplicates. After this the entry
   * is treated as abandoned (tab suspended, promise never settled) so the user
   * is never locked out of their own form.
   */
  inFlightTtlMs?: number;
  /**
   * How long a successful submission is replayed instead of re-run. Keeps a
   * double-submit after a slow success from producing a second transaction.
   */
  successTtlMs?: number;
  /** Injected clock, for tests. */
  now?: () => number;
}

/** Inputs that make a submission unique. */
export interface IdempotencyKeyInput {
  /** Operation namespace, e.g. `transfer` or `mint`. */
  scope: string;
  /** Signing address, so two wallets never share a key. */
  actor?: string | null;
  /** The submitted values. Order-independent; `undefined` fields are ignored. */
  payload: unknown;
}
