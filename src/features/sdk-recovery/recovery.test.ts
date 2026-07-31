import { describe, expect, it } from 'vitest';
import { classifySdkError } from '@/features/sdk-recovery/classify';
import { SDK_ERROR_FIXTURES, getSdkErrorFixture } from '@/features/sdk-recovery/fixtures';
import { buildRecoveryPlan, primaryAction } from '@/features/sdk-recovery/recovery';
import type { ClassifiedSdkError } from '@/features/sdk-recovery/types';

const planFor = (fixtureId: string) => {
  const fixture = getSdkErrorFixture(fixtureId);
  return buildRecoveryPlan(classifySdkError(fixture.failure, fixture.context));
};

describe('buildRecoveryPlan — shape', () => {
  it.each(SDK_ERROR_FIXTURES.map((fixture) => [fixture.id, fixture] as const))(
    'produces a usable plan for %s',
    (_id, fixture) => {
      const plan = buildRecoveryPlan(classifySdkError(fixture.failure, fixture.context));
      expect(plan.actions.length).toBeGreaterThan(0);
      expect(plan.title).not.toBe('');
      expect(plan.summary).not.toBe('');
      expect(plan.actions.filter((action) => action.primary)).toHaveLength(1);
      expect(primaryAction(plan)).toBe(plan.actions[0]);
    },
  );
});

describe('buildRecoveryPlan — action selection', () => {
  it('offers wallet reconnection when the wallet is unavailable', () => {
    expect(planFor('wallet-locked').actions[0].id).toBe('connect_wallet');
  });

  it('offers a plain retry after a declined signature', () => {
    const plan = planFor('signature-declined');
    expect(plan.actions[0].id).toBe('retry');
    expect(plan.retry).toBeNull();
  });

  it('offers a network switch on mismatch', () => {
    expect(planFor('network-mismatch').actions[0].id).toBe('switch_network');
  });

  it('leads with backoff retry when the endpoint is throttling', () => {
    const plan = planFor('rate-limited');
    expect(plan.actions[0].id).toBe('retry_with_backoff');
    expect(plan.retry?.maxAttempts).toBeGreaterThan(1);
  });

  it('leads with an explorer check when the outcome is unconfirmed', () => {
    const plan = planFor('indeterminate-hash');
    expect(plan.actions[0].id).toBe('check_explorer');
    expect(plan.retry).toBeNull();
  });

  it('sends the user back to the form for input and balance problems', () => {
    expect(planFor('invalid-address').actions[0].id).toBe('review_input');
    expect(planFor('insufficient-funds').actions[0].id).toBe('review_input');
  });

  it('adds an explorer check to any plan that carries a hash', () => {
    const error: ClassifiedSdkError = {
      ...classifySdkError(new Error('User declined the request')),
      txHash: 'abc123',
    };
    expect(buildRecoveryPlan(error).actions.map((action) => action.id)).toContain('check_explorer');
  });
});

describe('buildRecoveryPlan — safety rules', () => {
  it('never auto-retries a submission that may already be live', () => {
    for (const fixture of SDK_ERROR_FIXTURES) {
      const error = classifySdkError(fixture.failure, fixture.context);
      const plan = buildRecoveryPlan(error);

      if (error.sideEffectRisk !== 'none') {
        expect(plan.actions.every((action) => !action.safeToAutomate)).toBe(true);
      }
    }
  });

  it('requires the original idempotency key whenever a submission may have applied', () => {
    expect(planFor('timeout').reuseIdempotencyKey).toBe(true);
    expect(planFor('rpc-unreachable').reuseIdempotencyKey).toBe(true);
    expect(planFor('indeterminate-hash').reuseIdempotencyKey).toBe(true);
  });

  it('does not require key reuse when nothing was submitted', () => {
    expect(planFor('signature-declined').reuseIdempotencyKey).toBe(false);
    expect(planFor('invalid-address').reuseIdempotencyKey).toBe(false);
  });

  it('never offers a retry for deterministic compliance refusals', () => {
    const plan = planFor('compliance-blocked');
    expect(plan.actions.map((action) => action.id)).not.toContain('retry');
    expect(plan.actions.map((action) => action.id)).not.toContain('retry_with_backoff');
  });
});

describe('buildRecoveryPlan — compliance wording', () => {
  it('attaches a non-advisory note to compliance failures', () => {
    const note = planFor('compliance-blocked').complianceNote ?? '';
    expect(note).toMatch(/not legal or financial advice/i);
  });

  it('does not attach compliance notes to transport failures', () => {
    expect(planFor('rpc-unreachable').complianceNote).toBeUndefined();
  });
});
