import { describe, expect, it, vi } from 'vitest';
import { classifySdkError } from '@/features/sdk-recovery/classify';
import { DEFAULT_RETRY_POLICY, RATE_LIMIT_RETRY_POLICY } from '@/features/sdk-recovery/recovery';
import { computeBackoffDelay, runWithRecovery, shouldAutoRetry } from '@/features/sdk-recovery/retry';
import type { RetryPolicy } from '@/features/sdk-recovery/types';

const NO_JITTER: RetryPolicy = { ...DEFAULT_RETRY_POLICY, jitterRatio: 0 };
const noSleep = async () => {};
const midpoint = () => 0.5;

describe('computeBackoffDelay', () => {
  it('doubles the base delay on each attempt', () => {
    expect(computeBackoffDelay(1, NO_JITTER, midpoint)).toBe(400);
    expect(computeBackoffDelay(2, NO_JITTER, midpoint)).toBe(800);
    expect(computeBackoffDelay(3, NO_JITTER, midpoint)).toBe(1600);
  });

  it('clamps to the policy ceiling', () => {
    expect(computeBackoffDelay(20, NO_JITTER, midpoint)).toBe(NO_JITTER.maxDelayMs);
  });

  it('applies symmetric jitter within the configured ratio', () => {
    const low = computeBackoffDelay(1, DEFAULT_RETRY_POLICY, () => 0);
    const high = computeBackoffDelay(1, DEFAULT_RETRY_POLICY, () => 1);
    expect(low).toBe(320);
    expect(high).toBe(480);
  });

  it('never returns a negative delay', () => {
    const policy: RetryPolicy = { ...DEFAULT_RETRY_POLICY, jitterRatio: 5 };
    expect(computeBackoffDelay(1, policy, () => 0)).toBeGreaterThanOrEqual(0);
  });

  it('treats attempt numbers below one as the first attempt', () => {
    expect(computeBackoffDelay(0, NO_JITTER, midpoint)).toBe(400);
    expect(computeBackoffDelay(-3, NO_JITTER, midpoint)).toBe(400);
  });

  it('gives throttling a longer schedule than a transient blip', () => {
    expect(computeBackoffDelay(1, { ...RATE_LIMIT_RETRY_POLICY, jitterRatio: 0 }, midpoint)).toBe(
      1500,
    );
  });
});

describe('shouldAutoRetry', () => {
  const transient = classifySdkError(new TypeError('Failed to fetch'));
  const declined = classifySdkError(new Error('User declined the request'));
  const compliance = classifySdkError({
    status: 'FAILED',
    errorMessage: 'Recipient is not KYC whitelisted.',
  });

  it('refuses without a policy', () => {
    expect(shouldAutoRetry(declined, 1, null)).toBe(false);
  });

  it('refuses for non-retriable categories', () => {
    expect(shouldAutoRetry(compliance, 1, DEFAULT_RETRY_POLICY)).toBe(false);
  });

  it('refuses once attempts are exhausted', () => {
    expect(shouldAutoRetry(declined, DEFAULT_RETRY_POLICY.maxAttempts, DEFAULT_RETRY_POLICY)).toBe(
      false,
    );
  });

  it('refuses when the request may already have applied', () => {
    expect(transient.retriable).toBe(true);
    expect(transient.sideEffectRisk).toBe('possible');
    expect(shouldAutoRetry(transient, 1, DEFAULT_RETRY_POLICY)).toBe(false);
  });

  it('allows a retry that provably cannot duplicate state', () => {
    expect(shouldAutoRetry(declined, 1, DEFAULT_RETRY_POLICY)).toBe(true);
  });
});

describe('runWithRecovery', () => {
  it('returns the value on first success', async () => {
    const outcome = await runWithRecovery(async () => 'ok', { sleep: noSleep });
    expect(outcome).toEqual({ ok: true, value: 'ok', attempts: 1 });
  });

  it('retries a safely-retriable failure until it succeeds', async () => {
    const operation = vi
      .fn(async (): Promise<string> => 'signed')
      .mockRejectedValueOnce(new Error('User declined the request'));

    const outcome = await runWithRecovery(operation, {
      policy: NO_JITTER,
      sleep: noSleep,
      random: midpoint,
    });

    expect(outcome).toEqual({ ok: true, value: 'signed', attempts: 2 });
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('stops at the attempt ceiling and returns the plan', async () => {
    const operation = vi.fn(async () => {
      throw new Error('User declined the request');
    });

    const outcome = await runWithRecovery(operation, {
      policy: NO_JITTER,
      sleep: noSleep,
      random: midpoint,
    });

    expect(operation).toHaveBeenCalledTimes(NO_JITTER.maxAttempts);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error.category).toBe('wallet_rejected');
      expect(outcome.plan.actions[0].id).toBe('retry');
      expect(outcome.attempts).toBe(NO_JITTER.maxAttempts);
    }
  });

  it('does not retry a failure that may already be on the network', async () => {
    const operation = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    const outcome = await runWithRecovery(operation, { sleep: noSleep, random: midpoint });

    expect(operation).toHaveBeenCalledTimes(1);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.plan.reuseIdempotencyKey).toBe(true);
  });

  it('reports scheduled retries with their delay', async () => {
    const onRetryScheduled = vi.fn();
    const operation = vi
      .fn(async (): Promise<string> => 'signed')
      .mockRejectedValueOnce(new Error('User declined the request'));

    await runWithRecovery(operation, {
      policy: NO_JITTER,
      sleep: noSleep,
      random: midpoint,
      onRetryScheduled,
    });

    expect(onRetryScheduled).toHaveBeenCalledTimes(1);
    expect(onRetryScheduled.mock.calls[0][0]).toMatchObject({ attempt: 1, delayMs: 400 });
  });

  it('reports every attempt in order', async () => {
    const attempts: number[] = [];
    await runWithRecovery(
      async () => {
        throw new Error('User declined the request');
      },
      {
        policy: NO_JITTER,
        sleep: noSleep,
        random: midpoint,
        onAttempt: (attempt) => attempts.push(attempt),
      },
    );

    expect(attempts).toEqual([1, 2, 3]);
  });

  it('passes caller context through to classification', async () => {
    const outcome = await runWithRecovery(
      async () => {
        throw new Error('Request failed');
      },
      { context: { walletConnected: false }, sleep: noSleep },
    );

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.error.category).toBe('wallet_unavailable');
  });

  it('waits between attempts using the injected sleep', async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    await runWithRecovery(
      async () => {
        throw new Error('User declined the request');
      },
      { policy: NO_JITTER, sleep, random: midpoint },
    );

    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([400, 800]);
  });
});
