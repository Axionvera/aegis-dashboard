import type { TransactionResult, TransactionStatus } from './types';

/**
 * Normalises whatever a transaction call gives back — an RPC response, a
 * thrown error, a bare status string — into a single `TransactionResult` the
 * receipt can render.
 */

const SUCCESS_STATUSES = new Set(['success', 'confirmed', 'completed', 'applied']);

const FAILURE_STATUSES = new Set([
  'failed',
  'failure',
  'error',
  'rejected',
  'duplicate',
  'malformed',
  'try_again_later_error',
]);

const PENDING_STATUSES = new Set([
  'pending',
  'submitted',
  'not_found',
  'try_again_later',
]);

const MESSAGES: Record<TransactionStatus, string> = {
  success: 'Transaction confirmed',
  failure: 'Transaction failed',
  pending: 'Transaction submitted',
  unknown: 'Transaction status unknown',
};

const DETAILS: Partial<Record<TransactionStatus, string>> = {
  pending:
    'The network has accepted it and is still confirming. This usually takes a few seconds.',
  unknown:
    "We couldn't confirm the outcome. Check the explorer before retrying — the transaction may still go through.",
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;

const asText = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value instanceof Error && value.message.trim()) return value.message.trim();
  const record = asRecord(value);
  if (record && typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }
  return undefined;
};

const classify = (status: string | undefined): TransactionStatus => {
  if (!status) return 'unknown';
  const key = status.trim().toLowerCase();
  if (SUCCESS_STATUSES.has(key)) return 'success';
  if (FAILURE_STATUSES.has(key)) return 'failure';
  if (PENDING_STATUSES.has(key)) return 'pending';
  return 'unknown';
};

/**
 * Accepts anything a transaction call can produce:
 *
 * - an `Error` (or a rejected promise value) → `failure`
 * - `{ status, hash, error }` from the RPC → mapped by status table
 * - a bare status string such as `'SUCCESS'` → mapped by status table
 * - `null`, `undefined` or an unrecognised status → `unknown`
 *
 * An `error` field always wins: a response carrying an error is a failure even
 * if it also carries a success-looking status.
 */
export const mapToTransactionResult = (outcome: unknown): TransactionResult => {
  if (outcome instanceof Error) {
    return {
      status: 'failure',
      message: MESSAGES.failure,
      detail: asText(outcome),
    };
  }

  if (typeof outcome === 'string') {
    const status = classify(outcome);
    return { status, message: MESSAGES[status], detail: DETAILS[status] };
  }

  const record = asRecord(outcome);
  if (!record) {
    return {
      status: 'unknown',
      message: MESSAGES.unknown,
      detail: DETAILS.unknown,
    };
  }

  const txHash =
    (typeof record.hash === 'string' && record.hash.trim()) ||
    (typeof record.txHash === 'string' && record.txHash.trim()) ||
    undefined;

  const errorText = asText(record.error) ?? asText(record.errorMessage);
  const hasError = record.error != null || Boolean(errorText);

  const status: TransactionStatus = hasError
    ? 'failure'
    : classify(typeof record.status === 'string' ? record.status : undefined);

  return {
    status,
    txHash: txHash || undefined,
    message: MESSAGES[status],
    detail: status === 'failure' ? errorText ?? DETAILS.failure : DETAILS[status],
  };
};
