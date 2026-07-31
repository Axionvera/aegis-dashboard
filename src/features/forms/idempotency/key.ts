import type { IdempotencyKeyInput } from '@/features/forms/idempotency/types';

/**
 * Deterministic idempotency keys.
 *
 * The key is derived from the submission's *content*, not from a random id, so
 * two independent renders of the same intent (a double-click, a remount, a
 * retry from the recovery panel) collapse onto one key. Changing any submitted
 * value — recipient, amount, asset, signer — produces a different key and is
 * therefore treated as a new, legitimate submission.
 */

/**
 * Canonical JSON: object keys sorted, `undefined` dropped, cycles rejected.
 * Without this, `{a:1,b:2}` and `{b:2,a:1}` would hash differently and the
 * guard would miss real duplicates.
 */
export const stableStringify = (value: unknown, seen: Set<object> = new Set()): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'null';
  }
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'function' || typeof value === 'symbol') return '"[unserializable]"';

  if (value instanceof Date) return JSON.stringify(value.toISOString());

  if (typeof value === 'object') {
    if (seen.has(value)) return '"[circular]"';
    seen.add(value);

    if (Array.isArray(value)) {
      const body = value.map((item) => stableStringify(item, seen)).join(',');
      seen.delete(value);
      return `[${body}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([itemKey, item]) => `${JSON.stringify(itemKey)}:${stableStringify(item, seen)}`);

    seen.delete(value);
    return `{${entries.join(',')}}`;
  }

  return '"[unserializable]"';
};

/**
 * FNV-1a, 32-bit, rendered as 8 hex chars.
 *
 * This is a *collision-resistance-free* hash: it exists to keep keys short and
 * readable in logs, not to hide their contents. Anything security-sensitive
 * must not be inferred from a key, and the key itself must never be treated as
 * a secret.
 */
export const hashString = (input: string): string => {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    // 32-bit FNV prime multiply, kept in range with Math.imul.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
};

const normaliseActor = (actor?: string | null): string => {
  const trimmed = actor?.trim();
  if (!trimmed) return 'anonymous';
  return trimmed.length > 12 ? `${trimmed.slice(0, 4)}${trimmed.slice(-4)}` : trimmed;
};

/**
 * Builds the key for one submission, e.g. `transfer:GABC1234:1f3a9c02`.
 *
 * The scope and actor stay readable so a key is useful in a support thread; the
 * payload is hashed so amounts and addresses are not duplicated in the clear
 * anywhere the key is logged.
 */
export const createIdempotencyKey = ({ scope, actor, payload }: IdempotencyKeyInput): string =>
  `${scope.trim() || 'submission'}:${normaliseActor(actor)}:${hashString(stableStringify(payload))}`;
