import type { PortfolioAsset } from '@/lib/aegis/types';
import { explainPortfolioTransferEligibility } from '@/lib/eligibility';

const BADGE_STYLES = {
  compliant: 'bg-green-50 text-green-700 border-green-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  unknown: 'bg-amber-50 text-amber-700 border-amber-200',
  unavailable: 'bg-slate-100 text-slate-600 border-slate-200',
} as const;

interface TransferRestrictionExplainerProps {
  asset: PortfolioAsset;
  compact?: boolean;
}

export default function TransferRestrictionExplainer({ asset, compact = false }: TransferRestrictionExplainerProps) {
  const result = explainPortfolioTransferEligibility(asset);

  return (
    <div
      className={`rounded-lg border border-slate-200 ${compact ? 'bg-slate-50 p-3' : 'bg-white p-4 shadow-sm'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Transfer eligibility
          </div>
          <p className="mt-1 text-sm text-slate-600">{result.message}</p>
          {result.hint ? <p className="mt-1 text-xs text-slate-400">{result.hint}</p> : null}
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${BADGE_STYLES[result.state]}`}>
          {result.title}
        </span>
      </div>
    </div>
  );
}
