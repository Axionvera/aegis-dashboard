import { getExplorerUrl } from '@/components/transactions/explorerLink';
import { mapToTransactionResult } from '@/components/transactions/statusMapper';
import type {
  TransactionAction,
  TransactionDetailRow,
  TransactionResult,
  TransactionStatus,
} from '@/components/transactions/types';
import type {
  AdminActionOperation,
  AdminActionReceipt,
  AdminActionReceiptInput,
  AdminReceiptNextAction,
} from './types';

interface OperationPresentation {
  action: TransactionAction;
  label: string;
  title: string;
}

const OPERATION_PRESENTATION: Record<
  AdminActionOperation,
  OperationPresentation
> = {
  'whitelist-add': {
    action: 'whitelist',
    label: 'Whitelist add',
    title: 'Whitelist update receipt',
  },
  'whitelist-remove': {
    action: 'whitelist',
    label: 'Whitelist revoke',
    title: 'Whitelist update receipt',
  },
  'asset-registration': {
    action: 'asset-registration',
    label: 'Asset registration',
    title: 'Asset registration receipt',
  },
  'role-change': {
    action: 'role-change',
    label: 'Role change',
    title: 'Role change receipt',
  },
  mint: {
    action: 'mint',
    label: 'Mint',
    title: 'Mint receipt',
  },
};

const SUCCESS_NEXT_ACTION: Record<
  AdminActionOperation,
  AdminReceiptNextAction
> = {
  'whitelist-add': {
    label: 'Back to whitelist',
    description: 'Review the updated address in whitelist management.',
  },
  'whitelist-remove': {
    label: 'Back to whitelist',
    description: 'Review the revoked address in whitelist management.',
  },
  'asset-registration': {
    label: 'Create another',
    description:
      'The request is pending compliance review; no asset was minted.',
  },
  'role-change': {
    label: 'Review role assignments',
    description: 'Verify the account now has the intended protocol role.',
  },
  mint: {
    label: 'Mint another',
    description: 'Review the confirmed amount before starting another mint.',
  },
};

const RECEIPT_STATUSES = new Set<TransactionStatus>([
  'success',
  'failure',
  'pending',
  'unknown',
]);

function isTransactionResult(value: unknown): value is TransactionResult {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<TransactionResult>;
  return (
    typeof candidate.status === 'string' &&
    RECEIPT_STATUSES.has(candidate.status as TransactionStatus) &&
    typeof candidate.message === 'string'
  );
}

function nextActionFor(
  operation: AdminActionOperation,
  status: TransactionStatus,
): AdminReceiptNextAction {
  if (status === 'success') return SUCCESS_NEXT_ACTION[operation];

  if (status === 'failure') {
    return {
      label: 'Review action',
      description:
        'Check the target and permissions before attempting this action again.',
    };
  }

  return {
    label: 'Check transaction status',
    description:
      'Verify the latest network state before retrying to avoid a duplicate action.',
  };
}

function detailRows(input: AdminActionReceiptInput): TransactionDetailRow[] {
  const presentation = OPERATION_PRESENTATION[input.operation];
  const metadata = input.metadata;

  return [
    { label: 'Operation', value: presentation.label },
    { label: 'Target', value: input.target, mono: true },
    ...(metadata?.asset
      ? [{ label: 'Asset', value: metadata.asset }]
      : []),
    ...(metadata?.amount
      ? [{ label: 'Amount', value: metadata.amount }]
      : []),
    ...(metadata?.role ? [{ label: 'Role', value: metadata.role }] : []),
    ...(metadata?.requestId
      ? [{ label: 'Request ID', value: metadata.requestId, mono: true }]
      : []),
    ...(metadata?.note ? [{ label: 'Note', value: metadata.note }] : []),
    { label: 'Network', value: input.network?.trim() || 'Not applicable' },
  ];
}

function limitationFor(
  operation: AdminActionOperation,
  txHash: string | undefined,
  explorerUrl: string | null,
): string | undefined {
  if (operation === 'asset-registration') {
    return 'Asset registration is currently a local issuance request. It does not submit an on-chain transaction, so no transaction hash or explorer link is available.';
  }

  if (operation === 'role-change') {
    return 'Role-change SDK submission is not wired in this dashboard yet. Fixture receipts document the expected view; live hash and explorer support depend on the provider response.';
  }

  if (!txHash) {
    return 'The provider did not return a transaction hash. Confirm the action in the admin list or transaction history before retrying.';
  }

  if (!explorerUrl) {
    return 'A transaction hash was returned, but this wallet network is not supported by the configured explorer link.';
  }

  return undefined;
}

/**
 * Maps SDK/provider outcomes and local admin requests into one receipt model.
 * Status normalization and explorer URL construction reuse the shared
 * transaction helpers so admin receipts follow the same semantics as investor
 * receipts.
 */
export function mapAdminActionReceipt(
  input: AdminActionReceiptInput,
): AdminActionReceipt {
  const presentation = OPERATION_PRESENTATION[input.operation];
  const mappedResult = isTransactionResult(input.outcome)
    ? input.outcome
    : mapToTransactionResult(input.outcome);
  const result = {
    ...mappedResult,
    message:
      mappedResult.status === 'success' &&
      input.operation === 'asset-registration'
        ? 'Request submitted'
        : mappedResult.message,
  };
  const explorerUrl = getExplorerUrl(result.txHash, input.network);

  return {
    operation: input.operation,
    target: input.target,
    result,
    explorerUrl,
    nextAction: nextActionFor(input.operation, result.status),
    limitation: limitationFor(
      input.operation,
      result.txHash,
      explorerUrl,
    ),
    details: {
      action: presentation.action,
      title: presentation.title,
      rows: detailRows(input),
      network: input.network ?? undefined,
    },
  };
}
