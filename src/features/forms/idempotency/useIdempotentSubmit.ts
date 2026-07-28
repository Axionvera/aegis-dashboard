import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createIdempotencyKey } from '@/features/forms/idempotency/key';
import { IdempotencyLedger, submissionLedger } from '@/features/forms/idempotency/ledger';
import type { GuardVerdict } from '@/features/forms/idempotency/types';

/**
 * React binding for the idempotency guard.
 *
 * Wraps a submit handler so that the *same form values* can only produce one
 * live submission. The key is recomputed from the payload on every render, so
 * editing the form naturally unlocks a new submission while spamming the button
 * does not.
 */

export type SubmitStatus = 'idle' | 'submitting' | 'blocked' | 'succeeded' | 'failed';

export type GuardedSubmitOutcome<TResult> =
  | { status: 'submitted'; result: TResult; key: string }
  | { status: 'blocked'; verdict: GuardVerdict<TResult>; key: string }
  | { status: 'failed'; error: unknown; key: string };

export interface UseIdempotentSubmitOptions<TResult> {
  /** Operation namespace, e.g. `transfer`. */
  scope: string;
  /** Signing address, so keys are never shared between wallets. */
  actor?: string | null;
  /** The values being submitted; any change produces a new key. */
  payload: unknown;
  /** Override the shared ledger. Mainly for tests and isolated flows. */
  ledger?: IdempotencyLedger<TResult>;
  /** Called when the guard blocks a submission. */
  onBlocked?: (verdict: GuardVerdict<TResult>) => void;
}

export interface UseIdempotentSubmitResult<TResult> {
  /** The key the next submission would use. */
  key: string;
  status: SubmitStatus;
  isSubmitting: boolean;
  /** Explanation of the most recent blocked attempt, if any. */
  blockedMessage: string | null;
  lastVerdict: GuardVerdict<TResult> | null;
  /**
   * Runs `operation` under the guard. The key is passed through so the caller
   * can forward it to the SDK once server-side de-duplication exists.
   */
  submit: (operation: (key: string) => Promise<TResult>) => Promise<GuardedSubmitOutcome<TResult>>;
  /** Clears local status and forgets the key, allowing a clean re-submit. */
  reset: () => void;
  /**
   * Releases an in-flight claim for a submission that provably never left the
   * client (for example the user cancelled before the wallet prompt appeared).
   * Never call it for a request that may already be on the network.
   */
  abandon: () => void;
}

export function useIdempotentSubmit<TResult = unknown>({
  scope,
  actor,
  payload,
  ledger,
  onBlocked,
}: UseIdempotentSubmitOptions<TResult>): UseIdempotentSubmitResult<TResult> {
  const activeLedger = (ledger ?? submissionLedger) as IdempotencyLedger<TResult>;
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [lastVerdict, setLastVerdict] = useState<GuardVerdict<TResult> | null>(null);

  // Serialising the payload keeps the key stable across renders that recreate
  // an equivalent object literal — the common case for controlled forms.
  const key = useMemo(
    () => createIdempotencyKey({ scope, actor, payload }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scope, actor, JSON.stringify(payload ?? null)],
  );

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Deliberately NOT releasing an in-flight claim here. Unmounting (closing
      // the modal) does not cancel a submission that already left the client,
      // so freeing the key would let the very next render submit a duplicate.
      // The in-flight TTL is what eventually releases an abandoned entry.
    };
  }, []);

  const submit = useCallback(
    async (operation: (key: string) => Promise<TResult>): Promise<GuardedSubmitOutcome<TResult>> => {
      const verdict = activeLedger.begin(key);
      setLastVerdict(verdict);

      if (!verdict.allowed) {
        setStatus('blocked');
        onBlocked?.(verdict);
        return { status: 'blocked', verdict, key };
      }

      setStatus('submitting');

      try {
        const result = await operation(key);
        activeLedger.settle(key, { ok: true, result });
        if (isMounted.current) setStatus('succeeded');
        return { status: 'submitted', result, key };
      } catch (error) {
        activeLedger.settle(key, { ok: false, error });
        if (isMounted.current) setStatus('failed');
        return { status: 'failed', error, key };
      }
    },
    [activeLedger, key, onBlocked],
  );

  const reset = useCallback(() => {
    activeLedger.forget(key);
    setStatus('idle');
    setLastVerdict(null);
  }, [activeLedger, key]);

  const abandon = useCallback(() => activeLedger.abandon(key), [activeLedger, key]);

  return {
    key,
    status,
    isSubmitting: status === 'submitting',
    blockedMessage: status === 'blocked' ? lastVerdict?.message ?? null : null,
    lastVerdict,
    submit,
    reset,
    abandon,
  };
}
