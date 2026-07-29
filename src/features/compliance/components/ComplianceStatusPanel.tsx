import {
  Ban,
  CheckCircle,
  Clock,
  HelpCircle,
  ShieldOff,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';
import { truncateAddress } from '@/utils/formatting';
import { useComplianceStatus } from '@/features/compliance/hooks/useComplianceStatus';
import type { AddressComplianceState } from '@/features/compliance/types';

const STATE_STYLES: Record<
  AddressComplianceState,
  { badge: string; icon: LucideIcon }
> = {
  approved: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  blocked: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    icon: Ban,
  },
  pending: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  revoked: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: ShieldOff,
  },
  unknown: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: HelpCircle,
  },
  unavailable: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: WifiOff,
  },
};

interface ComplianceStatusPanelProps {
  /** Address to inspect. Defaults to the connected wallet when omitted by callers. */
  address: string | null;
  /** Optional heading override for investor vs admin placement. */
  title?: string;
  /** Compact layout for embedding beside portfolio cards. */
  compact?: boolean;
}

export default function ComplianceStatusPanel({
  address,
  title = 'Compliance Status',
  compact = false,
}: ComplianceStatusPanelProps) {
  const { status, record, error, refetch } = useComplianceStatus(address);

  if (!address) {
    return (
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600">
          Connect a wallet to view protocol-level compliance status for that address.
        </p>
        <p className="text-xs text-slate-400 mt-3">{COMPLIANCE_DISCLAIMER}</p>
      </section>
    );
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
        <div className="h-8 w-28 bg-slate-200 rounded mb-3" />
        <div className="h-4 w-full bg-slate-100 rounded mb-2" />
        <div className="h-4 w-2/3 bg-slate-100 rounded" />
      </section>
    );
  }

  if (!record) {
    return (
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600">
          {error ?? 'Compliance status is unavailable right now.'}
        </p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 text-sm font-medium text-aegis-brand hover:underline"
        >
          Retry
        </button>
        <p className="text-xs text-slate-400 mt-3">{COMPLIANCE_DISCLAIMER}</p>
      </section>
    );
  }

  const style = STATE_STYLES[record.state];
  const Icon = style.icon;

  return (
    <section
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${
        compact ? 'p-4' : 'p-5'
      }`}
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {truncateAddress(record.address)}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded border ${style.badge}`}
        >
          <Icon size={14} aria-hidden="true" />
          {record.label}
        </span>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{record.explanation}</p>

      {!compact && (
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
          {record.reasonCode && (
            <div>
              <dt className="font-medium text-slate-600">Reason code</dt>
              <dd className="font-mono mt-0.5">{record.reasonCode}</dd>
            </div>
          )}
          {record.evaluatedAt && (
            <div>
              <dt className="font-medium text-slate-600">Last evaluated</dt>
              <dd className="mt-0.5">{new Date(record.evaluatedAt).toLocaleString()}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-slate-600">Source</dt>
            <dd className="mt-0.5 capitalize">{record.source}</dd>
          </div>
        </dl>
      )}

      {status === 'error' && (
        <button
          type="button"
          onClick={refetch}
          className="mt-3 text-sm font-medium text-aegis-brand hover:underline"
        >
          Retry
        </button>
      )}

      <p className="text-xs text-slate-400 mt-4">{COMPLIANCE_DISCLAIMER}</p>
      <p className="text-xs text-slate-400 mt-1">
        This panel does not perform real-world KYC and is not a legal determination.
      </p>
    </section>
  );
}
