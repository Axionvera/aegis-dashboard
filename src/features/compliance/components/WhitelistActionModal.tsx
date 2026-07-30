import { useState } from 'react';
import TransactionReviewModal from '@/components/transactions/TransactionReviewModal';
import TransactionProgress from '@/components/transactions/TransactionProgress';
import { buildWhitelistSummary } from '@/components/transactions/operationSummary';
import {
  AdminActionReceiptView,
  mapAdminActionReceipt,
  type AdminActionReceipt,
} from '@/features/admin/receipts';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';
import type { TransactionPhase } from '@/components/transactions/types';

export type WhitelistAction = 'add' | 'remove';

export interface WhitelistActionModalProps {
  action: WhitelistAction;
  address: string;
  note?: string;
  network?: string;
  /**
   * Performs the signed action. Receives an `onPhase` callback so the modal
   * can show "waiting for signature" vs "submitting to the network".
   */
  onSubmit: (onPhase: (phase: TransactionPhase) => void) => Promise<unknown>;
  /** Called once the modal is dismissed, whether or not the action ran. */
  onClose: (didSucceed: boolean) => void;
}

type Phase = 'review' | TransactionPhase | 'receipt';

/**
 * Review-before-signing flow for a single whitelist add/remove action.
 * Reuses the shared TransactionReviewModal / progress / receipt building blocks
 * so every signed action in the dashboard looks and behaves the same way.
 */
export default function WhitelistActionModal({
  action,
  address,
  note,
  network,
  onSubmit,
  onClose,
}: WhitelistActionModalProps) {
  const [phase, setPhase] = useState<Phase>('review');
  const [receipt, setReceipt] = useState<AdminActionReceipt | null>(null);

  const details = buildWhitelistSummary({ action, address, note, network });

  const handleConfirm = async () => {
    setPhase('signing');
    try {
      const outcome = await onSubmit((nextPhase) => setPhase(nextPhase));
      setReceipt(
        mapAdminActionReceipt({
          operation: action === 'add' ? 'whitelist-add' : 'whitelist-remove',
          target: address,
          outcome,
          network,
          metadata: { note },
        }),
      );
    } catch (err) {
      setReceipt(
        mapAdminActionReceipt({
          operation: action === 'add' ? 'whitelist-add' : 'whitelist-remove',
          target: address,
          outcome: err,
          network,
          metadata: { note },
        }),
      );
    } finally {
      setPhase('receipt');
    }
  };

  const succeeded = receipt?.result.status === 'success';

  if (phase === 'review') {
    return (
      <TransactionReviewModal
        details={details}
        onConfirm={handleConfirm}
        onCancel={() => onClose(false)}
        footer={COMPLIANCE_DISCLAIMER}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div
        className="relative mt-12 w-full max-w-md rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={details.title}
      >
        <div className="p-6">
          {(phase === 'signing' || phase === 'pending') && (
            <TransactionProgress state={phase} />
          )}

          {phase === 'receipt' && receipt && (
            <AdminActionReceiptView
              receipt={receipt}
              onNextAction={() => onClose(succeeded)}
              onClose={() => onClose(succeeded)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
