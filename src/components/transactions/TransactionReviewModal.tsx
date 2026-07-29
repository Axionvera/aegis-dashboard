import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import TransactionReview from './TransactionReview';
import type { TransactionDetails } from './types';

export interface TransactionReviewModalProps {
  details: TransactionDetails;
  onConfirm: () => void;
  onCancel: () => void;
  /** Disables review actions while a confirmation is in flight. */
  isSubmitting?: boolean;
  /**
   * Optional footer beneath the review body — typically a compliance
   * disclaimer for whitelist / compliance-update actions.
   */
  footer?: ReactNode;
  /** Accessible label for the dialog. Defaults to the operation title. */
  ariaLabel?: string;
}

/**
 * Dedicated review-before-signing modal for sensitive dashboard actions.
 *
 * Wraps {@link TransactionReview} in a dialog shell. Callers that already own
 * a modal (for example the investor transfer flow) can keep rendering
 * `TransactionReview` inline; flows that open a standalone confirmation should
 * use this component.
 */
export default function TransactionReviewModal({
  details,
  onConfirm,
  onCancel,
  isSubmitting = false,
  footer,
  ariaLabel,
}: TransactionReviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <div
        className="relative mt-12 w-full max-w-md rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? details.title}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label="Close modal"
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <TransactionReview
            details={details}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
          />
          {footer ? <div className="mt-4 text-center text-xs text-slate-400">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
