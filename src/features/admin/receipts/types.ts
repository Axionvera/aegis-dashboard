import type {
  TransactionDetails,
  TransactionResult,
} from '@/components/transactions/types';

/** Major privileged operations represented by the admin receipt view. */
export type AdminActionOperation =
  | 'whitelist-add'
  | 'whitelist-remove'
  | 'asset-registration'
  | 'role-change'
  | 'mint';

/** Extra operation data used to build receipt rows. */
export interface AdminActionReceiptMetadata {
  asset?: string;
  amount?: string;
  role?: string;
  requestId?: string;
  note?: string;
}

/** Raw input from an admin flow or SDK/provider outcome. */
export interface AdminActionReceiptInput {
  operation: AdminActionOperation;
  target: string;
  outcome: unknown;
  network?: string | null;
  metadata?: AdminActionReceiptMetadata;
}

export interface AdminReceiptNextAction {
  label: string;
  description: string;
}

/** Normalized model consumed by the admin receipt view. */
export interface AdminActionReceipt {
  operation: AdminActionOperation;
  target: string;
  details: TransactionDetails;
  result: TransactionResult;
  explorerUrl: string | null;
  nextAction: AdminReceiptNextAction;
  /**
   * Explains missing chain evidence for local/mock actions or outcomes where a
   * hash was not returned.
   */
  limitation?: string;
}
