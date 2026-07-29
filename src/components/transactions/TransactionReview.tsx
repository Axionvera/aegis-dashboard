import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { TRANSACTION_ACTION_LABELS, type TransactionDetails } from './types';

interface TransactionReviewProps {
  details: TransactionDetails;
  onConfirm: () => void;
  onCancel: () => void;
  /** Disables both buttons while the confirmation is being handled. */
  isSubmitting?: boolean;
}

/**
 * Last screen before a signature: shows exactly what the user is about to sign.
 * Layout-agnostic — render it inside a modal or straight into a page section.
 */
export default function TransactionReview({
  details,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: TransactionReviewProps) {
  const riskNotes = details.riskNotes ?? [];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-aegis-brand">
          {TRANSACTION_ACTION_LABELS[details.action]}
        </p>
        <h2 className="text-lg sm:text-xl font-bold text-aegis-dark">{details.title}</h2>
        {details.description && (
          <p className="mt-1 text-sm text-slate-600">{details.description}</p>
        )}
      </header>

      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {details.rows.map((row) => (
          <div
            key={`${row.label}-${row.value}`}
            className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <dt className="text-sm text-slate-500">{row.label}</dt>
            <dd
              className={`text-sm font-medium text-aegis-dark sm:max-w-[60%] sm:text-right ${
                row.mono ? 'font-mono break-all' : ''
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {details.expectedResult && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Expected result
          </p>
          <p className="mt-1 text-sm text-emerald-900">{details.expectedResult}</p>
        </div>
      )}

      {riskNotes.length > 0 && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <AlertTriangle size={14} aria-hidden="true" />
            Risk notes
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {riskNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <ShieldCheck size={16} className="mt-px shrink-0 text-aegis-accent" />
        <span>
          You&apos;ll be asked to sign this in your wallet. Nothing is submitted to the
          network until you approve it.
        </span>
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:space-x-3 sm:gap-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded bg-slate-100 py-2 font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 rounded bg-aegis-brand py-2 font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm & Sign'}
        </button>
      </div>
    </div>
  );
}
