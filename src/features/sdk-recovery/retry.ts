import { classifySdkError } from '@/features/sdk-recovery/classify';
import { buildRecoveryPlan } from '@/features/sdk-recovery/recovery';
import type {
  ClassifiedSdkError,
  RecoveryPlan,
  RetryPolicy,
} from '@/features/sdk-recovery/types';

/**
 * Backoff maths and the retry executor used by SDK-facing flows.
 *
 * `sleep` and `random` are injected so tests stay deterministic and instant —
 * no fake timers required.
 */

export interface RetryRunnerOptions {
  /** Overrides the policy the recovery plan suggests. */
  policy?: RetryPolicy;
  /** Live context passed through to `classifySdkError`. */
  context?: { walletConnected?: boolean; networkMatches?: boolean };
  /** Called before every attempt, 1-indexed. */
  onAttempt?: (attempt: number) => void;
  /** Called after a failed attempt that will be retried. */
  onRetryScheduled?: (info: { attempt: number; delayMs: number; plan: RecoveryPlan }) => void;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

export type RetryOutcome<T> =
  | { ok: true; value: T; attempts: number }
  | { ok: false; error: ClassifiedSdkError; plan: RecoveryPlan; attempts: number };

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Exponential backoff with jitter, clamped to the policy's ceiling.
 *
 * `attempt` is 1-indexed: the delay *after* attempt 1 is `baseDelayMs`.
 * Jitter is symmetric (±`jitterRatio`) so retries from many clients spread out
 * instead of stampeding the RPC endpoint together.
 */
export const computeBackoffDelay = (
  attempt: number,
  policy: RetryPolicy,
  random: () => number = Math.random,
): number => {
  const safeAttempt = Math.max(1, Math.floor(attempt));
  const exponential = policy.baseDelayMs * 2 ** (safeAttempt - 1);
  const capped = Math.min(exponential, policy.maxDelayMs);
  const jitterSpan = capped * Math.min(Math.max(policy.jitterRatio, 0), 1);
  const offset = (random() * 2 - 1) * jitterSpan;

  return Math.max(0, Math.round(capped + offset));
};

/**
 * Whether attempt number `attempt` may be followed by another one.
 *
 * A retry needs three things: a retriable category, a policy with attempts
 * left, and an operation that cannot have already applied on-chain. The last
 * condition is what stops the dashboard from silently double-submitting a
 * transfer whose response was lost.
 */
export const shouldAutoRetry = (
  error: ClassifiedSdkError,
  attempt: number,
  policy: RetryPolicy | null,
): boolean => {
  if (!policy || !error.retriable) return false;
  if (attempt >= policy.maxAttempts) return false;
  return error.sideEffectRisk === 'none';
};

/**
 * Runs an SDK call, retrying it according to its own recovery plan.
 *
 * Resolves with the value on success, or with the classified error and plan
 * once retries are exhausted or the failure is not safely retriable. It never
 * throws for SDK failures — callers render the plan instead of writing another
 * catch block.
 */
export async function runWithRecovery<T>(
  operation: () => Promise<T>,
  options: RetryRunnerOptions = {},
): Promise<RetryOutcome<T>> {
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;
  let attempt = 0;

  // Bounded by the policy check inside the loop; the ceiling here only guards
  // against a policy with a nonsensical maxAttempts.
  for (;;) {
    attempt += 1;
    options.onAttempt?.(attempt);

    try {
      return { ok: true, value: await operation(), attempts: attempt };
    } catch (failure) {
      const error = classifySdkError(failure, options.context);
      const plan = buildRecoveryPlan(error);
      const policy = options.policy ?? plan.retry;

      if (!shouldAutoRetry(error, attempt, policy) || !policy) {
        return { ok: false, error, plan, attempts: attempt };
      }

      const delayMs = computeBackoffDelay(attempt, policy, random);
      options.onRetryScheduled?.({ attempt, delayMs, plan });
      await sleep(delayMs);
    }
  }
}
