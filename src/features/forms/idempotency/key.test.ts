import { describe, expect, it } from 'vitest';
import { createIdempotencyKey, hashString, stableStringify } from '@/features/forms/idempotency/key';
import {
  FIXTURE_ANONYMOUS_SUBMISSION,
  FIXTURE_MINT_SUBMISSION,
  FIXTURE_TRANSFER_DIFFERENT_AMOUNT,
  FIXTURE_TRANSFER_OTHER_SIGNER,
  FIXTURE_TRANSFER_REORDERED,
  FIXTURE_TRANSFER_SUBMISSION,
  FIXTURE_TRANSFER_WITH_UNDEFINED,
} from '@/features/forms/idempotency/fixtures';

describe('stableStringify', () => {
  it('is order-independent for object keys', () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(stableStringify({ b: 2, a: 1 }));
  });

  it('is order-dependent for arrays', () => {
    expect(stableStringify([1, 2])).not.toBe(stableStringify([2, 1]));
  });

  it('drops undefined object fields but keeps null', () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe(stableStringify({ a: 1 }));
    expect(stableStringify({ a: 1, b: null })).not.toBe(stableStringify({ a: 1 }));
  });

  it('normalises non-finite numbers instead of throwing', () => {
    expect(stableStringify({ a: Number.NaN })).toBe('{"a":null}');
    expect(stableStringify({ a: Infinity })).toBe('{"a":null}');
  });

  it('serialises dates by instant, not by object identity', () => {
    const iso = '2026-07-28T00:00:00.000Z';
    expect(stableStringify(new Date(iso))).toBe(stableStringify(new Date(iso)));
  });

  it('survives circular references', () => {
    const node: Record<string, unknown> = { id: 1 };
    node.self = node;
    expect(() => stableStringify(node)).not.toThrow();
    expect(stableStringify(node)).toContain('[circular]');
  });

  it('does not confuse a number with its string form', () => {
    expect(stableStringify({ amount: 10 })).not.toBe(stableStringify({ amount: '10' }));
  });
});

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('transfer')).toBe(hashString('transfer'));
  });

  it('always returns 8 hex characters', () => {
    for (const input of ['', 'a', 'transfer:GABC:10', 'x'.repeat(1000)]) {
      expect(hashString(input)).toMatch(/^[0-9a-f]{8}$/);
    }
  });

  it('separates near-identical inputs', () => {
    expect(hashString('amount:10')).not.toBe(hashString('amount:11'));
  });
});

describe('createIdempotencyKey', () => {
  it('collapses the same intent onto one key regardless of field order', () => {
    expect(createIdempotencyKey(FIXTURE_TRANSFER_SUBMISSION)).toBe(
      createIdempotencyKey(FIXTURE_TRANSFER_REORDERED),
    );
  });

  it('ignores explicitly-undefined fields', () => {
    expect(createIdempotencyKey(FIXTURE_TRANSFER_SUBMISSION)).toBe(
      createIdempotencyKey(FIXTURE_TRANSFER_WITH_UNDEFINED),
    );
  });

  it('separates different amounts', () => {
    expect(createIdempotencyKey(FIXTURE_TRANSFER_SUBMISSION)).not.toBe(
      createIdempotencyKey(FIXTURE_TRANSFER_DIFFERENT_AMOUNT),
    );
  });

  it('separates different signers', () => {
    expect(createIdempotencyKey(FIXTURE_TRANSFER_SUBMISSION)).not.toBe(
      createIdempotencyKey(FIXTURE_TRANSFER_OTHER_SIGNER),
    );
  });

  it('separates different operations with identical payloads', () => {
    expect(createIdempotencyKey(FIXTURE_TRANSFER_SUBMISSION)).not.toBe(
      createIdempotencyKey(FIXTURE_MINT_SUBMISSION),
    );
  });

  it('namespaces submissions made without a connected wallet', () => {
    expect(createIdempotencyKey(FIXTURE_ANONYMOUS_SUBMISSION)).toContain(':anonymous:');
  });

  it('keeps the scope readable and truncates the actor', () => {
    const key = createIdempotencyKey(FIXTURE_TRANSFER_SUBMISSION);
    const [scope, actor, hash] = key.split(':');
    expect(scope).toBe('transfer');
    expect(actor).toHaveLength(8);
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });

  it('does not leak the raw payload into the key', () => {
    const key = createIdempotencyKey(FIXTURE_TRANSFER_SUBMISSION);
    const payload = FIXTURE_TRANSFER_SUBMISSION.payload as { assetId: string; recipient: string };
    expect(key).not.toContain(payload.assetId);
    expect(key).not.toContain(payload.recipient);
  });

  it('falls back to a default scope when none is given', () => {
    expect(createIdempotencyKey({ scope: '  ', payload: { a: 1 } })).toContain('submission:');
  });
});
