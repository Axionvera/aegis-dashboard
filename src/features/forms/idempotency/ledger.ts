import type {
  GuardVerdict,
  IdempotencyLedgerOptions,
  SubmissionEntry,
} from '@/features/forms/idempotency/types';

/**
 * In-memory ledger of keyed submissions.
 *
 * One entry per idempotency key records whether that exact submission is
 * running, has succeeded, or has failed. `begin` is the guard: it is the only
 * place that decides whether a caller may submit.
 *
 * Deliberately not persisted. A reload means we can no longer prove what is
 * in flight, and a stale "already submitted" claim across sessions would be
 * worse than asking the user to check the explorer.
 */

/** An unresolved submission blocks duplicates for this long. */
export const DEFAULT_IN_FLIGHT_TTL_MS = 60_000;
/** A success is replayed instead of re-run for this long. */
export const DEFAULT_SUCCESS_TTL_MS = 5 * 60_000;

const BLOCKED_MESSAGES = {
  duplicate_in_flight:
    'This submission is already being processed. Wait for it to finish instead of submitting again.',
  replay_result:
    'An identical submission already went through. Showing that result instead of submitting a second one.',
} as const;

export class IdempotencyLedger<TResult = unknown> {
  private readonly entries = new Map<string, SubmissionEntry<TResult>>();

  private readonly inFlightTtlMs: number;

  private readonly successTtlMs: number;

  private readonly now: () => number;

  constructor(options: IdempotencyLedgerOptions = {}) {
    this.inFlightTtlMs = options.inFlightTtlMs ?? DEFAULT_IN_FLIGHT_TTL_MS;
    this.successTtlMs = options.successTtlMs ?? DEFAULT_SUCCESS_TTL_MS;
    this.now = options.now ?? Date.now;
  }

  /** Current entry for a key, if it has not expired. */
  peek(key: string): SubmissionEntry<TResult> | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    return this.isExpired(entry) ? undefined : entry;
  }

  /**
   * Ask permission to submit under `key`.
   *
   * Marks the key in-flight and returns `allowed: true` when the caller may
   * proceed. A blocked verdict carries the existing entry so the UI can show
   * the earlier result rather than a bare error.
   *
   * Callers must pair every allowed verdict with `settle` (or `abandon`),
   * otherwise the key stays blocked until the in-flight TTL elapses.
   */
  begin(key: string): GuardVerdict<TResult> {
    const existing = this.entries.get(key);

    if (existing && !this.isExpired(existing)) {
      if (existing.state === 'in_flight') {
        return {
          decision: 'duplicate_in_flight',
          key,
          allowed: false,
          entry: existing,
          message: BLOCKED_MESSAGES.duplicate_in_flight,
        };
      }

      if (existing.state === 'succeeded') {
        return {
          decision: 'replay_result',
          key,
          allowed: false,
          entry: existing,
          message: BLOCKED_MESSAGES.replay_result,
        };
      }

      // Failed: the operation did not apply, so a fresh attempt is correct.
      const retried = this.start(key, existing);
      return { decision: 'retry_after_failure', key, allowed: true, entry: retried };
    }

    // An expired in-flight entry means we lost track of the original attempt.
    // We let the user proceed — but the decision is distinguishable so callers
    // can warn that the earlier submission's outcome is unconfirmed.
    const decision =
      existing?.state === 'in_flight' ? 'proceed_after_stale' : 'proceed';
    const started = this.start(key, existing);

    return { decision, key, allowed: true, entry: started };
  }

  /** Record the outcome of an allowed submission. */
  settle(
    key: string,
    outcome: { ok: true; result?: TResult } | { ok: false; error?: unknown },
  ): SubmissionEntry<TResult> | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    const settled: SubmissionEntry<TResult> = {
      ...entry,
      state: outcome.ok ? 'succeeded' : 'failed',
      settledAt: this.now(),
      result: outcome.ok ? outcome.result : entry.result,
      error: outcome.ok ? undefined : outcome.error,
    };

    this.entries.set(key, settled);
    return settled;
  }

  /**
   * Drop an in-flight claim without recording an outcome — used when a
   * submission never actually left the client (component unmounted, user
   * cancelled at the wallet prompt before signing).
   */
  abandon(key: string): void {
    const entry = this.entries.get(key);
    if (entry?.state === 'in_flight') this.entries.delete(key);
  }

  /** Forget a key entirely, e.g. after the user edits the form. */
  forget(key: string): void {
    this.entries.delete(key);
  }

  /** Remove every expired entry. Safe to call on an interval or on mount. */
  prune(): number {
    let removed = 0;
    const expired: string[] = [];

    this.entries.forEach((entry, key) => {
      if (this.isExpired(entry)) expired.push(key);
    });

    expired.forEach((key) => {
      this.entries.delete(key);
      removed += 1;
    });

    return removed;
  }

  /** Test/diagnostic helper: every live entry. */
  snapshot(): SubmissionEntry<TResult>[] {
    return Array.from(this.entries.values()).filter((entry) => !this.isExpired(entry));
  }

  clear(): void {
    this.entries.clear();
  }

  private start(key: string, previous?: SubmissionEntry<TResult>): SubmissionEntry<TResult> {
    const entry: SubmissionEntry<TResult> = {
      key,
      state: 'in_flight',
      startedAt: this.now(),
      attempts: (previous?.attempts ?? 0) + 1,
    };

    this.entries.set(key, entry);
    return entry;
  }

  private isExpired(entry: SubmissionEntry<TResult>): boolean {
    const age = this.now() - (entry.settledAt ?? entry.startedAt);

    if (entry.state === 'in_flight') return age >= this.inFlightTtlMs;
    if (entry.state === 'succeeded') return age >= this.successTtlMs;
    // Failures stop blocking immediately; they only carry history.
    return age >= this.successTtlMs;
  }
}

/**
 * Process-wide ledger shared by every form in the tab.
 *
 * Sharing one instance is what makes the guard work across component
 * boundaries: the same intent submitted from a modal and from a retry button
 * resolves to the same key and therefore the same entry.
 */
export const submissionLedger = new IdempotencyLedger();
