import type { IdempotencyKeyInput } from '@/features/forms/idempotency/types';

/**
 * Submission payloads covering the cases the guard has to separate (issue #39):
 * identical intents, near-identical intents that must NOT collide, and payloads
 * whose shape differs only by key order or absent fields.
 */

const SIGNER = 'GABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCD';
const RECIPIENT = 'GXYZ9876543210XYZ9876543210XYZ9876543210XYZ987654321';

export const FIXTURE_TRANSFER_SUBMISSION: IdempotencyKeyInput = {
  scope: 'transfer',
  actor: SIGNER,
  payload: { assetId: 'ny-cre', recipient: RECIPIENT, amount: 10 },
};

/** Same intent, object keys in a different order: must produce the same key. */
export const FIXTURE_TRANSFER_REORDERED: IdempotencyKeyInput = {
  scope: 'transfer',
  actor: SIGNER,
  payload: { amount: 10, recipient: RECIPIENT, assetId: 'ny-cre' },
};

/** Same intent plus an explicitly-undefined field: must still match. */
export const FIXTURE_TRANSFER_WITH_UNDEFINED: IdempotencyKeyInput = {
  scope: 'transfer',
  actor: SIGNER,
  payload: { assetId: 'ny-cre', recipient: RECIPIENT, amount: 10, memo: undefined },
};

/** Different amount: a genuinely new submission. */
export const FIXTURE_TRANSFER_DIFFERENT_AMOUNT: IdempotencyKeyInput = {
  scope: 'transfer',
  actor: SIGNER,
  payload: { assetId: 'ny-cre', recipient: RECIPIENT, amount: 10.5 },
};

/** Same values submitted by a different wallet: must not collide. */
export const FIXTURE_TRANSFER_OTHER_SIGNER: IdempotencyKeyInput = {
  scope: 'transfer',
  actor: RECIPIENT,
  payload: { assetId: 'ny-cre', recipient: RECIPIENT, amount: 10 },
};

/** Same values under a different operation: must not collide. */
export const FIXTURE_MINT_SUBMISSION: IdempotencyKeyInput = {
  scope: 'mint',
  actor: SIGNER,
  payload: { assetId: 'ny-cre', recipient: RECIPIENT, amount: 10 },
};

/** No wallet connected — keys still form, namespaced as anonymous. */
export const FIXTURE_ANONYMOUS_SUBMISSION: IdempotencyKeyInput = {
  scope: 'transfer',
  actor: null,
  payload: { assetId: 'ny-cre', recipient: RECIPIENT, amount: 10 },
};

export const ALL_IDEMPOTENCY_FIXTURES: IdempotencyKeyInput[] = [
  FIXTURE_TRANSFER_SUBMISSION,
  FIXTURE_TRANSFER_REORDERED,
  FIXTURE_TRANSFER_WITH_UNDEFINED,
  FIXTURE_TRANSFER_DIFFERENT_AMOUNT,
  FIXTURE_TRANSFER_OTHER_SIGNER,
  FIXTURE_MINT_SUBMISSION,
  FIXTURE_ANONYMOUS_SUBMISSION,
];
