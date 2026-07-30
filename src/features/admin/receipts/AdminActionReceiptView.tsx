import TransactionReceipt from '@/components/transactions/TransactionReceipt';
import type { AdminActionReceipt } from './types';

export interface AdminActionReceiptViewProps {
  receipt: AdminActionReceipt;
  /** Performs the operation-specific next step described by the receipt. */
  onNextAction: () => void;
  /** Dismisses the receipt without starting another action. */
  onClose: () => void;
}

/**
 * Receipt view for privileged dashboard actions.
 *
 * The mapper owns status/operation/target/hash/explorer/next-action semantics;
 * this component reuses the shared transaction receipt presentation so admin
 * and investor outcomes remain visually and behaviorally consistent.
 */
export default function AdminActionReceiptView({
  receipt,
  onNextAction,
  onClose,
}: AdminActionReceiptViewProps) {
  return (
    <TransactionReceipt
      result={receipt.result}
      details={receipt.details}
      explorerUrl={receipt.explorerUrl}
      limitation={receipt.limitation}
      nextAction={{
        ...receipt.nextAction,
        onClick: onNextAction,
      }}
      onClose={onClose}
    />
  );
}
