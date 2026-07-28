import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_IN_FLIGHT_TTL_MS,
  DEFAULT_SUCCESS_TTL_MS,
  IdempotencyLedger,
} from '@/features/forms/idempotency/ledger';

const KEY = 'transfer:GABCABCD:1f3a9c02';
const OTHER_KEY = 'transfer:GABCABCD:9d0b7714';

/** Ledger backed by a clock the test moves by hand. */
const createLedger = () => {
  let clock = 1_000;
  const ledger = new IdempotencyLedger<string>({ now: () => clock });
  return {
    ledger,
    advance: (ms: number) => {
      clock += ms;
    },
  };
};

describe('IdempotencyLedger — first submission', () => {
  let ledger: IdempotencyLedger<string>;

  beforeEach(() => {
    ledger = createLedger().ledger;
  });

  it('allows an unseen key', () => {
    const verdict = ledger.begin(KEY);
    expect(verdict).toMatchObject({ decision: 'proceed', allowed: true, key: KEY });
    expect(verdict.entry?.attempts).toBe(1);
  });

  it('records the submission as in flight', () => {
    ledger.begin(KEY);
    expect(ledger.peek(KEY)?.state).toBe('in_flight');
  });

  it('keeps unrelated keys independent', () => {
    ledger.begin(KEY);
    expect(ledger.begin(OTHER_KEY).allowed).toBe(true);
  });
});

describe('IdempotencyLedger — duplicate suppression', () => {
  it('blocks a second submission while the first is in flight', () => {
    const { ledger } = createLedger();
    ledger.begin(KEY);

    const verdict = ledger.begin(KEY);
    expect(verdict.decision).toBe('duplicate_in_flight');
    expect(verdict.allowed).toBe(false);
    expect(verdict.message).toMatch(/already being processed/i);
  });

  it('blocks a rapid burst of identical submissions', () => {
    const { ledger } = createLedger();
    const verdicts = [ledger.begin(KEY), ledger.begin(KEY), ledger.begin(KEY), ledger.begin(KEY)];
    expect(verdicts.filter((verdict) => verdict.allowed)).toHaveLength(1);
  });

  it('replays a success instead of resubmitting', () => {
    const { ledger } = createLedger();
    ledger.begin(KEY);
    ledger.settle(KEY, { ok: true, result: 'tx_hash_1' });

    const verdict = ledger.begin(KEY);
    expect(verdict.decision).toBe('replay_result');
    expect(verdict.allowed).toBe(false);
    expect(verdict.entry?.result).toBe('tx_hash_1');
  });

  it('allows a new attempt after a failure', () => {
    const { ledger } = createLedger();
    ledger.begin(KEY);
    ledger.settle(KEY, { ok: false, error: new Error('declined') });

    const verdict = ledger.begin(KEY);
    expect(verdict.decision).toBe('retry_after_failure');
    expect(verdict.allowed).toBe(true);
    expect(verdict.entry?.attempts).toBe(2);
  });
});

describe('IdempotencyLedger — expiry', () => {
  it('releases an abandoned in-flight entry after the TTL', () => {
    const { ledger, advance } = createLedger();
    ledger.begin(KEY);
    advance(DEFAULT_IN_FLIGHT_TTL_MS - 1);
    expect(ledger.begin(KEY).allowed).toBe(false);

    advance(2);
    const verdict = ledger.begin(KEY);
    expect(verdict.decision).toBe('proceed_after_stale');
    expect(verdict.allowed).toBe(true);
  });

  it('stops replaying a success after the replay window', () => {
    const { ledger, advance } = createLedger();
    ledger.begin(KEY);
    ledger.settle(KEY, { ok: true, result: 'tx_hash_1' });

    advance(DEFAULT_SUCCESS_TTL_MS - 1);
    expect(ledger.begin(KEY).decision).toBe('replay_result');

    advance(2);
    expect(ledger.begin(KEY).decision).toBe('proceed');
  });

  it('hides expired entries from peek and snapshot', () => {
    const { ledger, advance } = createLedger();
    ledger.begin(KEY);
    advance(DEFAULT_IN_FLIGHT_TTL_MS + 1);

    expect(ledger.peek(KEY)).toBeUndefined();
    expect(ledger.snapshot()).toHaveLength(0);
  });

  it('prunes expired entries and reports how many went', () => {
    const { ledger, advance } = createLedger();
    ledger.begin(KEY);
    ledger.begin(OTHER_KEY);
    advance(DEFAULT_IN_FLIGHT_TTL_MS + 1);

    expect(ledger.prune()).toBe(2);
    expect(ledger.snapshot()).toHaveLength(0);
  });

  it('honours custom TTLs', () => {
    let clock = 0;
    const ledger = new IdempotencyLedger<string>({ inFlightTtlMs: 10, now: () => clock });
    ledger.begin(KEY);
    clock = 11;
    expect(ledger.begin(KEY).allowed).toBe(true);
  });
});

describe('IdempotencyLedger — lifecycle helpers', () => {
  it('settling an unknown key is a no-op', () => {
    const { ledger } = createLedger();
    expect(ledger.settle('missing', { ok: true })).toBeUndefined();
  });

  it('abandon releases an in-flight claim', () => {
    const { ledger } = createLedger();
    ledger.begin(KEY);
    ledger.abandon(KEY);
    expect(ledger.peek(KEY)).toBeUndefined();
    expect(ledger.begin(KEY).decision).toBe('proceed');
  });

  it('abandon never erases a settled result', () => {
    const { ledger } = createLedger();
    ledger.begin(KEY);
    ledger.settle(KEY, { ok: true, result: 'tx_hash_1' });
    ledger.abandon(KEY);

    expect(ledger.peek(KEY)?.state).toBe('succeeded');
    expect(ledger.begin(KEY).decision).toBe('replay_result');
  });

  it('forget clears history for a key', () => {
    const { ledger } = createLedger();
    ledger.begin(KEY);
    ledger.settle(KEY, { ok: true, result: 'tx_hash_1' });
    ledger.forget(KEY);

    const verdict = ledger.begin(KEY);
    expect(verdict.decision).toBe('proceed');
    expect(verdict.entry?.attempts).toBe(1);
  });

  it('clear empties the ledger', () => {
    const { ledger } = createLedger();
    ledger.begin(KEY);
    ledger.begin(OTHER_KEY);
    ledger.clear();
    expect(ledger.snapshot()).toHaveLength(0);
  });

  it('keeps the failure reason for diagnostics', () => {
    const { ledger } = createLedger();
    const error = new Error('declined');
    ledger.begin(KEY);
    ledger.settle(KEY, { ok: false, error });
    expect(ledger.peek(KEY)?.error).toBe(error);
  });
});
