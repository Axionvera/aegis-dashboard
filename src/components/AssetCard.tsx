import { formatAmount } from '@/utils/formatting';
import { ComplianceStatus } from '@/types/compliance';
import ComplianceBadge from './ComplianceBadge';

interface AssetCardProps {
  name: string;
  ticker: string;
  balance: number;
  complianceStatus?: ComplianceStatus;
  onTransferClick: () => void;
}

export default function AssetCard({ name, ticker, balance, complianceStatus, onTransferClick }: AssetCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">{name}</h3>
          <span className="text-xs font-semibold text-aegis-brand bg-blue-50 px-2 py-1 rounded">
            {ticker}
          </span>
        </div>
        <ComplianceBadge status={complianceStatus ?? 'unknown'} />
      </div>
      <div className="mb-6">
        <p className="text-sm text-slate-500 mb-1">Your Balance</p>
        <p className="text-2xl font-bold text-slate-900">{formatAmount(balance)} {ticker}</p>
      </div>
      <button
        onClick={onTransferClick}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition"
      >
        Transfer
      </button>
    </div>
  );
}
