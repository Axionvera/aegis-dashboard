import { useState } from 'react';
import { X } from 'lucide-react';
import TransactionReview from '@/components/transactions/TransactionReview';
import TransactionProgress from '@/components/transactions/TransactionProgress';
import TransactionReceipt from '@/components/transactions/TransactionReceipt';
import { mapToTransactionResult } from '@/components/transactions/statusMapper';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';
import { truncateAddress } from '@/utils/formatting';
import type {
  TransactionDetails,
  TransactionPhase,
  TransactionResult,
} from '@/components/transactions/types';

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

const ACTION_COPY: Record<WhitelistAction, { title: string; description: string }> = {
  add: {
    title: 'Add address to KYC whitelist',
    description: 'This grants the address permission to hold and receive this asset.',
  },
  remove: {
    title: 'Remove address from KYC whitelist',
    description: 'This revokes the address\u2019s permission to hold or receive this asset.',
  },
};

/**
 * Review-before-signing flow for a single whitelist add/remove action.
 * Reuses the same TransactionReview / TransactionProgress / TransactionReceipt
 * building blocks as the mint and bulk-compliance flows so every signed
 * action in the dashboard looks and behaves the same way.
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
  const [result, setResult] = useState<TransactionResult | null>(null);

  const copy = ACTION_COPY[action];

  const details: TransactionDetails = {
    action: 'whitelist',
    title: copy.title,
    description: copy.description,
    network,
    rows: [
      { label: 'Address', value: truncateAddress(address), mono: true },
      { label: 'Action', value: action === 'add' ? 'Whitelist' : 'Revoke' },
      ...(note ? [{ label: 'Note', value: note }] : []),
      { label: 'Network', value: network ?? 'Unknown' },
    ],
  };

  const handleConfirm = async () => {
    setPhase('signing');
    try {
      const outcome = await onSubmit((nextPhase) => setPhase(nextPhase));
      setResult(mapToTransactionResult(outcome));
    } catch (err) {
      setResult(mapToTransactionResult(err));
    } finally {
      setPhase('receipt');
    }
  };

  const succeeded = result?.status === 'success';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && phase === 'review') onClose(false);
      }}
    >
      <div
        className="relative mt-12 w-full max-w-md rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
      >
        {phase === 'review' && (
          <button
            type="button"
            onClick={() => onClose(false)}
            aria-label="Close modal"
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-6">
          {phase === 'review' && (
            <>
              <TransactionReview
                details={details}
                onConfirm={handleConfirm}
                onCancel={() => onClose(false)}
              />
              <p className="mt-4 text-xs text-slate-400 text-center">
                {COMPLIANCE_DISCLAIMER}
              </p>
            </>
          )}

          {(phase === 'signing' || phase === 'pending') && (
            <TransactionProgress state={phase} />
          )}

          {phase === 'receipt' && result && (
            <TransactionReceipt
              result={result}
              details={details}
              onClose={() => onClose(succeeded)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
