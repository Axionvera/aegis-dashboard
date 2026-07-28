/**
 * Shared vocabulary for every signed-transaction flow in the dashboard
 * (transfers, minting, compliance updates and admin actions).
 */

/**
 * Lifecycle of a transaction, from the review screen to a terminal receipt.
 *
 * - `idle`    — the user is still filling in the form.
 * - `review`  — details are shown for confirmation, nothing signed yet.
 * - `signing` — waiting for the wallet signature.
 * - `pending` — submitted to the network, waiting for confirmation.
 * - `success` / `failure` / `unknown` — terminal, rendered as a receipt.
 */
export type TransactionState =
  | 'idle'
  | 'review'
  | 'signing'
  | 'pending'
  | 'success'
  | 'failure'
  | 'unknown';

/** The two in-flight phases a caller can report while a transaction is running. */
export type TransactionPhase = Extract<TransactionState, 'signing' | 'pending'>;

/** Terminal outcome of a transaction, as rendered by the receipt. */
export type TransactionStatus = Extract<
  TransactionState,
  'pending' | 'success' | 'failure' | 'unknown'
>;

/** Which contract operation the user is about to sign. */
export type TransactionAction =
  | 'transfer'
  | 'mint'
  | 'whitelist'
  | 'compliance-update';

/** Human-readable label for each action, shared by review and receipt. */
export const TRANSACTION_ACTION_LABELS: Record<TransactionAction, string> = {
  transfer: 'Transfer',
  mint: 'Mint',
  whitelist: 'Whitelist',
  'compliance-update': 'Compliance update',
};

/** A single label/value line in the review and receipt summaries. */
export interface TransactionDetailRow {
  label: string;
  value: string;
  /** Render in a monospace font and allow wrapping (addresses, hashes). */
  mono?: boolean;
}

/** Everything the user needs to see before signing. */
export interface TransactionDetails {
  action: TransactionAction;
  title: string;
  description?: string;
  rows: TransactionDetailRow[];
  /** Stellar network name as reported by the wallet, e.g. `TESTNET`. */
  network?: string;
}

/** Normalised outcome, produced by `mapToTransactionResult`. */
export interface TransactionResult {
  status: TransactionStatus;
  /** Absent when the transaction never reached the network. */
  txHash?: string;
  /** Short headline for the receipt. */
  message: string;
  /** Optional second line: error text, next steps, etc. */
  detail?: string;
}

/**
 * Shape we expect back from the Soroban RPC / `@aegis/sdk` once the mocked
 * `useAegis` hook is replaced. `mapToTransactionResult` also accepts thrown
 * errors and bare status strings, so callers rarely need to build this by hand.
 */
export interface RawTransactionOutcome {
  status?: string | null;
  hash?: string | null;
  txHash?: string | null;
  error?: unknown;
  errorMessage?: string | null;
}
