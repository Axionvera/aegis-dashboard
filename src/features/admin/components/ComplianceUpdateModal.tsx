import { useState } from 'react';
import TransactionReceipt from '@/components/transactions/TransactionReceipt';
import TransactionReviewModal from '@/components/transactions/TransactionReviewModal';
import { buildComplianceUpdateSummary } from '@/components/transactions/operationSummary';
import { getExplorerUrl } from '@/components/transactions/explorerLink';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';
import { NetworkGuardNotice, useNetworkGuard } from '@/features/wallet';
import type { ComplianceSubject, BulkAction } from '@/lib/complianceReview';
import type { TransactionResult } from '@/components/transactions/types';

export const ACTION_LABELS: Record<BulkAction, string> = {
  approve: 'Approve',
  reject: 'Reject',
  'flag-for-review': 'Flag for Review',
  clear: 'Clear selection',
};

export interface ComplianceUpdateModalProps {
  subjects: ComplianceSubject[];
  action: BulkAction;
  network?: string;
  onConfirm: () => TransactionResult;
  onClose: () => void;
}

type Phase = 'review' | 'receipt';

export default function ComplianceUpdateModal({
  subjects,
  action,
  network,
  onConfirm,
  onClose,
}: ComplianceUpdateModalProps) {
  const [phase, setPhase] = useState<Phase>('review');
  const [result, setResult] = useState<TransactionResult | null>(null);

  const actionLabel = ACTION_LABELS[action];
  const details = buildComplianceUpdateSummary({
    action,
    subjects,
    network,
    actionLabel,
  });

  // Warn-only: this update is applied in the dashboard and never reaches the
  // wallet, so a mismatch is worth flagging but must not stop the reviewer.
  const networkGuard = useNetworkGuard('compliance-update');

  const handleConfirm = () => {
    const txResult = onConfirm();
    setResult(txResult);
    setPhase('receipt');
  };

  if (phase === 'review') {
    return (
      <TransactionReviewModal
        details={details}
        onConfirm={handleConfirm}
        onCancel={onClose}
        notice={<NetworkGuardNotice guard={networkGuard} />}
        footer={COMPLIANCE_DISCLAIMER}
        ariaLabel="Compliance update review"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative mt-12 w-full max-w-md rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Compliance update review"
      >
        <div className="p-6">
          {result && (
            <TransactionReceipt
              result={result}
              details={details}
              onClose={onClose}
              explorerUrl={getExplorerUrl(result.txHash, network)}
              limitation={
                result.txHash
                  ? undefined
                  : 'Bulk compliance updates are applied locally in this dashboard build. No on-chain transaction hash or explorer link is available until a provider-backed write lands.'
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
