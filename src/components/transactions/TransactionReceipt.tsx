import {
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { truncateAddress } from '@/utils/formatting';
import {
  TRANSACTION_ACTION_LABELS,
  type TransactionDetails,
  type TransactionResult,
  type TransactionStatus,
} from './types';

export interface TransactionReceiptAction {
  label: string;
  onClick: () => void;
  description?: string;
}

interface TransactionReceiptProps {
  result: TransactionResult;
  details: TransactionDetails;
  onClose: () => void;
  /**
   * Link to the transaction on stellar.expert. Pass the output of
   * `getExplorerUrl` — `null` simply hides the link.
   */
  explorerUrl?: string | null;
  /** Optional operation-specific action shown above the generic close button. */
  nextAction?: TransactionReceiptAction;
  /** Explains why a hash or explorer link may not be available. */
  limitation?: string;
}

const STATUS_STYLES: Record<
  TransactionStatus,
  { Icon: LucideIcon; iconClass: string; badgeClass: string; label: string }
> = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-aegis-accent',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    label: 'Success',
  },
  failure: {
    Icon: XCircle,
    iconClass: 'text-red-500',
    badgeClass: 'bg-red-50 text-red-600',
    label: 'Failed',
  },
  pending: {
    Icon: Clock,
    iconClass: 'text-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700',
    label: 'Pending',
  },
  unknown: {
    Icon: HelpCircle,
    iconClass: 'text-slate-400',
    badgeClass: 'bg-slate-100 text-slate-600',
    label: 'Unknown',
  },
};

/**
 * Terminal screen of a transaction flow. Renders the same way for every
 * outcome — success, failure, pending and unknown — so no flow has to invent
 * its own end state.
 */
export default function TransactionReceipt({
  result,
  details,
  onClose,
  explorerUrl,
  nextAction,
  limitation,
}: TransactionReceiptProps) {
  const { Icon, iconClass, badgeClass, label } = STATUS_STYLES[result.status];

  return (
    <div className="space-y-4">
      <header className="flex flex-col items-center gap-2 text-center">
        <Icon size={32} className={iconClass} aria-hidden="true" />
        <div>
          <h2 className="text-lg font-bold text-aegis-dark">{result.message}</h2>
          {result.detail && <p className="mt-1 text-sm text-slate-600">{result.detail}</p>}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
        >
          {TRANSACTION_ACTION_LABELS[details.action]} &middot; {label}
        </span>
      </header>

      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {details.rows.map((row) => (
          <div
            key={row.label}
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

        {result.txHash && (
          <div className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-sm text-slate-500">Transaction</dt>
            <dd className="font-mono text-sm font-medium text-aegis-dark break-all sm:text-right">
              {truncateAddress(result.txHash)}
            </dd>
          </div>
        )}
      </dl>

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-medium text-aegis-brand transition hover:text-blue-600"
        >
          View on Stellar Expert
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}

      {limitation && (
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          {limitation}
        </p>
      )}

      {nextAction && (
        <div className="space-y-2">
          {nextAction.description && (
            <p className="text-center text-xs text-slate-500">
              {nextAction.description}
            </p>
          )}
          <button
            type="button"
            onClick={nextAction.onClick}
            className="w-full rounded bg-aegis-brand py-2 font-medium text-white transition hover:bg-blue-600"
          >
            {nextAction.label}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className={`w-full rounded py-2 font-medium transition ${
          nextAction
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            : 'bg-aegis-dark text-white hover:bg-slate-800'
        }`}
      >
        Close
      </button>
    </div>
  );
}
