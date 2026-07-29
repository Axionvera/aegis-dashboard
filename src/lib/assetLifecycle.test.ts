import { describe, it, expect } from 'vitest';
import {
  isTerminalState,
  getAllowedNextStates,
  validateTransition,
  applyLifecycleTransition,
  LIFECYCLE_STATE_INFO,
  TERMINAL_STATES,
  type AssetLifecycleStatus,
} from './assetLifecycle';

describe('isTerminalState', () => {
  it('treats redeemed as terminal', () => {
    expect(isTerminalState('redeemed')).toBe(true);
  });

  it('treats active, paused, matured, and defaulted as non-terminal', () => {
    expect(isTerminalState('active')).toBe(false);
    expect(isTerminalState('paused')).toBe(false);
    expect(isTerminalState('matured')).toBe(false);
    expect(isTerminalState('defaulted')).toBe(false);
  });

  it('TERMINAL_STATES contains exactly the terminal states', () => {
    expect(TERMINAL_STATES).toEqual(['redeemed']);
  });
});

describe('getAllowedNextStates', () => {
  it('lists paused, matured, and defaulted from active', () => {
    expect(getAllowedNextStates('active')).toEqual(['paused', 'matured', 'defaulted']);
  });

  it('lists active and defaulted from paused', () => {
    expect(getAllowedNextStates('paused')).toEqual(['active', 'defaulted']);
  });

  it('lists only redeemed from matured', () => {
    expect(getAllowedNextStates('matured')).toEqual(['redeemed']);
  });

  it('lists only redeemed from defaulted (wind-down)', () => {
    expect(getAllowedNextStates('defaulted')).toEqual(['redeemed']);
  });

  it('lists nothing from redeemed', () => {
    expect(getAllowedNextStates('redeemed')).toEqual([]);
  });
});

describe('validateTransition', () => {
  it('rejects a same-state transition', () => {
    const result = validateTransition('active', 'active');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/already in the Active state/);
  });

  it('rejects any transition out of a terminal state', () => {
    const result = validateTransition('redeemed', 'active');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/terminal state/);
  });

  it('rejects a transition that skips required states (active -> redeemed)', () => {
    const result = validateTransition('active', 'redeemed');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/Cannot move directly/);
  });

  it('rejects a transition to an unrecognized state', () => {
    const result = validateTransition('active', 'unknown' as never);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/Unrecognized lifecycle state/);
  });

  it('accepts active -> paused', () => {
    expect(validateTransition('active', 'paused')).toEqual({ valid: true });
  });

  it('accepts paused -> active (resume)', () => {
    expect(validateTransition('paused', 'active')).toEqual({ valid: true });
  });

  it('accepts matured -> redeemed', () => {
    expect(validateTransition('matured', 'redeemed')).toEqual({ valid: true });
  });

  it('accepts defaulted -> redeemed (wind-down)', () => {
    expect(validateTransition('defaulted', 'redeemed')).toEqual({ valid: true });
  });
});

describe('applyLifecycleTransition', () => {
  const baseStatus: AssetLifecycleStatus = {
    current: 'active',
    since: '2026-01-01T00:00:00Z',
    history: [{ state: 'active', occurredAt: '2026-01-01T00:00:00Z' }],
  };

  it('returns a new status object on a valid transition, without mutating the input', () => {
    const result = applyLifecycleTransition(baseStatus, 'paused', '2026-07-20T00:00:00Z', 'Pausing for review.');

    expect(result.ok).toBe(true);
    expect(result.status).toEqual({
      current: 'paused',
      since: '2026-07-20T00:00:00Z',
      history: [
        { state: 'active', occurredAt: '2026-01-01T00:00:00Z' },
        { state: 'paused', occurredAt: '2026-07-20T00:00:00Z', note: 'Pausing for review.' },
      ],
    });
    // Original input must be untouched.
    expect(baseStatus.current).toBe('active');
    expect(baseStatus.history).toHaveLength(1);
  });

  it('rejects an invalid transition and returns a reason instead of a status', () => {
    const result = applyLifecycleTransition(baseStatus, 'redeemed', '2026-07-20T00:00:00Z');

    expect(result.ok).toBe(false);
    expect(result.status).toBeUndefined();
    expect(result.reason).toMatch(/Cannot move directly/);
  });

  it('rejects a transition attempted from a terminal state', () => {
    const redeemedStatus: AssetLifecycleStatus = {
      current: 'redeemed',
      since: '2026-06-01T00:00:00Z',
      history: [{ state: 'redeemed', occurredAt: '2026-06-01T00:00:00Z' }],
    };
    const result = applyLifecycleTransition(redeemedStatus, 'active', '2026-07-20T00:00:00Z');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/terminal state/);
  });
});

describe('LIFECYCLE_STATE_INFO', () => {
  it('provides label, detail, and tone for every state', () => {
    const states: Array<keyof typeof LIFECYCLE_STATE_INFO> = [
      'active',
      'paused',
      'matured',
      'redeemed',
      'defaulted',
    ];
    for (const state of states) {
      expect(LIFECYCLE_STATE_INFO[state].label).toBeTruthy();
      expect(LIFECYCLE_STATE_INFO[state].detail).toBeTruthy();
      expect(['positive', 'neutral', 'caution', 'negative']).toContain(LIFECYCLE_STATE_INFO[state].tone);
    }
  });

  it('avoids legal/financial-advice-sounding language in the default wording', () => {
    const forbidden = /\b(guarantee|guaranteed|safe investment|risk-free|advice)\b/i;
    for (const info of Object.values(LIFECYCLE_STATE_INFO)) {
      expect(info.detail).not.toMatch(forbidden);
    }
  });
});
