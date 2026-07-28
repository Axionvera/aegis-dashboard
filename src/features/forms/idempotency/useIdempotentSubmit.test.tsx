import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IdempotencyLedger } from '@/features/forms/idempotency/ledger';
import {
  useIdempotentSubmit,
  type GuardedSubmitOutcome,
} from '@/features/forms/idempotency/useIdempotentSubmit';

const PAYLOAD = { assetId: 'ny-cre', recipient: 'GXYZ', amount: 10 };
const ACTOR = 'GABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCD';

const setup = (payload: unknown = PAYLOAD) => {
  const ledger = new IdempotencyLedger<string>();
  const view = renderHook(
    ({ current }: { current: unknown }) =>
      useIdempotentSubmit<string>({ scope: 'transfer', actor: ACTOR, payload: current, ledger }),
    { initialProps: { current: payload } },
  );
  return { ledger, ...view };
};

/** A submission that stays pending until the test resolves it. */
const deferred = () => {
  let resolve!: (value: string) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('useIdempotentSubmit — happy path', () => {
  it('runs the operation and reports success', async () => {
    const { result } = setup();
    const operation = vi.fn(async () => 'tx_hash_1');

    let outcome: GuardedSubmitOutcome<string> | undefined;
    await act(async () => {
      outcome = await result.current.submit(operation);
    });

    expect(operation).toHaveBeenCalledTimes(1);
    expect(outcome).toMatchObject({ status: 'submitted', result: 'tx_hash_1' });
    expect(result.current.status).toBe('succeeded');
  });

  it('passes the key to the operation so it can be forwarded to the SDK', async () => {
    const { result } = setup();
    const operation = vi.fn(async () => 'tx_hash_1');

    await act(async () => {
      await result.current.submit(operation);
    });

    expect(operation).toHaveBeenCalledWith(result.current.key);
    expect(result.current.key.startsWith('transfer:')).toBe(true);
  });
});

describe('useIdempotentSubmit — duplicate suppression', () => {
  it('runs the operation once for concurrent submits of the same payload', async () => {
    const { result } = setup();
    const pending = deferred();
    const operation = vi.fn(() => pending.promise);

    let second: GuardedSubmitOutcome<string> | undefined;
    await act(async () => {
      const first = result.current.submit(operation);
      second = await result.current.submit(operation);
      pending.resolve('tx_hash_1');
      await first;
    });

    expect(operation).toHaveBeenCalledTimes(1);
    expect(second).toMatchObject({ status: 'blocked' });
  });

  it('surfaces a message explaining the blocked attempt', async () => {
    const { result } = setup();
    const pending = deferred();

    await act(async () => {
      void result.current.submit(() => pending.promise);
      await result.current.submit(() => pending.promise);
    });

    expect(result.current.status).toBe('blocked');
    expect(result.current.blockedMessage).toMatch(/already being processed/i);

    await act(async () => {
      pending.resolve('tx_hash_1');
      await pending.promise;
    });
  });

  it('notifies the caller when a submission is blocked', async () => {
    const ledger = new IdempotencyLedger<string>();
    const onBlocked = vi.fn();
    const { result } = renderHook(() =>
      useIdempotentSubmit<string>({
        scope: 'transfer',
        actor: ACTOR,
        payload: PAYLOAD,
        ledger,
        onBlocked,
      }),
    );

    const pending = deferred();
    await act(async () => {
      void result.current.submit(() => pending.promise);
      await result.current.submit(() => pending.promise);
    });

    expect(onBlocked).toHaveBeenCalledTimes(1);
    expect(onBlocked.mock.calls[0][0].decision).toBe('duplicate_in_flight');

    await act(async () => {
      pending.resolve('tx_hash_1');
      await pending.promise;
    });
  });

  it('replays a completed success rather than submitting twice', async () => {
    const { result } = setup();
    const operation = vi.fn(async () => 'tx_hash_1');

    await act(async () => {
      await result.current.submit(operation);
    });
    let repeat: GuardedSubmitOutcome<string> | undefined;
    await act(async () => {
      repeat = await result.current.submit(operation);
    });

    expect(operation).toHaveBeenCalledTimes(1);
    expect(repeat).toMatchObject({ status: 'blocked' });
    expect(repeat?.status === 'blocked' && repeat.verdict.decision).toBe('replay_result');
  });
});

describe('useIdempotentSubmit — legitimate resubmission', () => {
  it('allows a retry after the operation failed', async () => {
    const { result } = setup();
    const operation = vi
      .fn(async (): Promise<string> => 'tx_hash_1')
      .mockRejectedValueOnce(new Error('network down'));

    await act(async () => {
      await result.current.submit(operation);
    });
    expect(result.current.status).toBe('failed');

    await act(async () => {
      await result.current.submit(operation);
    });

    expect(operation).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('succeeded');
  });

  it('treats an edited payload as a new submission', async () => {
    const { result, rerender } = setup();
    const operation = vi.fn(async () => 'tx_hash_1');

    await act(async () => {
      await result.current.submit(operation);
    });
    const firstKey = result.current.key;

    rerender({ current: { ...PAYLOAD, amount: 11 } });
    await waitFor(() => expect(result.current.key).not.toBe(firstKey));

    await act(async () => {
      await result.current.submit(operation);
    });

    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('keeps the key stable across renders with an equivalent payload', async () => {
    const { result, rerender } = setup();
    const firstKey = result.current.key;

    rerender({ current: { ...PAYLOAD } });
    expect(result.current.key).toBe(firstKey);
  });

  it('reset clears the guard so the same payload can be submitted again', async () => {
    const { result } = setup();
    const operation = vi.fn(async () => 'tx_hash_1');

    await act(async () => {
      await result.current.submit(operation);
    });
    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.submit(operation);
    });

    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('abandon releases a claim for a submission that never left the client', async () => {
    const { result, ledger } = setup();
    const pending = deferred();

    await act(async () => {
      void result.current.submit(() => pending.promise);
    });
    expect(ledger.peek(result.current.key)?.state).toBe('in_flight');

    act(() => result.current.abandon());
    expect(ledger.peek(result.current.key)).toBeUndefined();

    await act(async () => {
      pending.resolve('tx_hash_1');
      await pending.promise;
    });
  });
});

describe('useIdempotentSubmit — unmount safety', () => {
  it('does not free the key when the component unmounts mid-flight', async () => {
    const { result, ledger, unmount } = setup();
    const pending = deferred();
    const key = result.current.key;

    await act(async () => {
      void result.current.submit(() => pending.promise);
    });

    unmount();

    expect(ledger.peek(key)?.state).toBe('in_flight');
    expect(ledger.begin(key).allowed).toBe(false);

    await act(async () => {
      pending.resolve('tx_hash_1');
      await pending.promise;
    });
  });
});
