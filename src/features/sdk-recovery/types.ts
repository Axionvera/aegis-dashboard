/**
 * Shared vocabulary for SDK error recovery (issue #43).
 *
 * Every call into `@aegis/sdk` (today: the mock client in
 * `src/lib/aegis/client.ts`) can fail in ways that need *different* user
 * responses. Retrying a rejected wallet signature is fine; retrying a
 * submission that may already be on the network is not. These types make that
 * distinction explicit so no flow has to re-invent it.
 *
 * IMPORTANT: nothing in this module makes a compliance determination. When an
 * error is compliance-shaped we surface the SDK's own reason and point the user
 * at the authoritative source; the copy must never read as legal or financial
 * advice.
 */

/**
 * What went wrong, from the dashboard's point of view. Categories are chosen by
 * the *recovery* they imply, not by which layer raised them — two different RPC
 * codes that both mean "try again shortly" share one category.
 */
export type SdkErrorCategory =
  /** No wallet is connected, or the extension is locked. */
  | 'wallet_unavailable'
  /** The user dismissed or declined the signature prompt. */
  | 'wallet_rejected'
  /** Wallet network does not match the network the dashboard targets. */
  | 'network_mismatch'
  /** RPC/host unreachable: offline, DNS, CORS, 5xx. */
  | 'network_unreachable'
  /** The call was aborted or exceeded its deadline. */
  | 'timeout'
  /** RPC throttling (429 / `try_again_later`). */
  | 'rate_limited'
  /** Contract or registry refused the operation on compliance grounds. */
  | 'compliance_blocked'
  /** Balance, fee or reserve is insufficient for the operation. */
  | 'insufficient_funds'
  /** Malformed request: bad address, bad amount, bad sequence. */
  | 'invalid_input'
  /** Submitted, but the outcome could not be read back. */
  | 'indeterminate'
  /** Nothing matched. Treated conservatively. */
  | 'unknown';

/**
 * Whether resubmitting could duplicate an on-chain state change.
 *
 * - `none`     — the operation provably never reached the network.
 * - `possible` — it may have been submitted; a retry must be idempotency-keyed.
 * - `confirmed`— it definitely reached the network; do not resubmit blindly.
 */
export type SideEffectRisk = 'none' | 'possible' | 'confirmed';

/** The recovery steps the dashboard knows how to offer. */
export type RecoveryActionId =
  | 'retry'
  | 'retry_with_backoff'
  | 'connect_wallet'
  | 'switch_network'
  | 'check_explorer'
  | 'review_input'
  | 'contact_support'
  | 'dismiss';

export interface RecoveryAction {
  id: RecoveryActionId;
  /** Button label. */
  label: string;
  /** One line explaining what the action does and why it helps. */
  description: string;
  /** Rendered first and with emphasis. At most one per plan. */
  primary: boolean;
  /**
   * True when the dashboard may perform this action on the user's behalf
   * without a fresh confirmation. Only ever true for actions that cannot
   * create or duplicate on-chain state.
   */
  safeToAutomate: boolean;
}

/** Normalised view of anything an SDK call can throw or return as a failure. */
export interface ClassifiedSdkError {
  category: SdkErrorCategory;
  /** True when re-running the same call is a sensible next step. */
  retriable: boolean;
  sideEffectRisk: SideEffectRisk;
  /** Short, user-facing headline. Never contains raw error text. */
  message: string;
  /** Redacted detail line from the underlying error, when there is one. */
  detail?: string;
  /** Present when the failed call still produced a hash worth checking. */
  txHash?: string;
  /** Transport/protocol code, when one was recognisable (e.g. `429`). */
  code?: string;
  /** The original value, kept for diagnostics. Never rendered directly. */
  raw?: unknown;
}

/** Backoff schedule for automatic retries of a retriable category. */
export interface RetryPolicy {
  /** Total attempts including the first one. */
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  /** Fraction of the delay (0–1) applied as random jitter. */
  jitterRatio: number;
}

/** Everything the UI needs to render a recovery surface for one failure. */
export interface RecoveryPlan {
  category: SdkErrorCategory;
  title: string;
  /** Plain-language summary of the situation. */
  summary: string;
  /** Ordered actions, primary first. Always at least one entry. */
  actions: RecoveryAction[];
  /** Null when the category must not be retried automatically. */
  retry: RetryPolicy | null;
  /**
   * True when a retry must reuse the *same* idempotency key so the backend can
   * de-duplicate a possible in-flight submission. See docs/form-idempotency.md.
   */
  reuseIdempotencyKey: boolean;
  /** Extra note shown for compliance-shaped failures. Informational only. */
  complianceNote?: string;
}
