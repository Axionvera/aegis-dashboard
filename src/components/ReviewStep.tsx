/**
 * ReviewStep – displays a read-only summary of the asset metadata before the
 * issuer signs and submits the registration transaction.
 */

import { FileText, Globe, Hash, Layers, Tag, AlignLeft } from 'lucide-react';
import type { AssetMetadata } from '@/lib/validateAssetMetadata';
import { ASSET_TYPE_OPTIONS } from '@/fixtures/assetFixtures';

interface ReviewStepProps {
  metadata: AssetMetadata;
  issuerAddress: string;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="mt-0.5 text-aegis-brand shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 break-all">{value}</p>
      </div>
    </div>
  );
}

export default function ReviewStep({
  metadata,
  issuerAddress,
  onConfirm,
  onBack,
  isSubmitting,
}: ReviewStepProps) {
  const assetTypeLabel =
    ASSET_TYPE_OPTIONS.find((o) => o.value === metadata.assetType)?.label ?? metadata.assetType;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Review Registration</h2>
        <p className="text-sm text-slate-500 mt-1">
          Confirm the details below. Once submitted, the metadata will be anchored on-chain.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm divide-y divide-slate-100">
        <Row icon={<Tag size={16} />} label="Asset Name" value={metadata.name} />
        <Row icon={<Hash size={16} />} label="Ticker Symbol" value={metadata.ticker} />
        <Row icon={<Layers size={16} />} label="Asset Type" value={assetTypeLabel} />
        <Row
          icon={<span className="text-sm font-bold">#</span>}
          label="Total Supply"
          value={Number(metadata.totalSupply).toLocaleString()}
        />
        <Row icon={<Globe size={16} />} label="Jurisdiction" value={metadata.jurisdiction} />
        <Row icon={<FileText size={16} />} label="Document URI" value={metadata.documentUri} />
        {metadata.description && (
          <Row icon={<AlignLeft size={16} />} label="Description" value={metadata.description} />
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-700">Signing as: </span>
        <span className="font-mono break-all">{issuerAddress}</span>
      </div>

      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        ⚠ Submitting this form prepares a Soroban transaction for your wallet to sign. This does
        not constitute legal verification or regulatory approval of the underlying asset.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-aegis-brand hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            'Sign & Register Asset'
          )}
        </button>
      </div>
    </div>
  );
}
