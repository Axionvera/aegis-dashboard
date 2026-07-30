import { useMemo } from 'react';
import AssetCard from '@/features/assets/components/AssetCard';
import PortfolioEmptyState from './PortfolioEmptyState';
import type { PortfolioAsset } from '@/lib/aegis/types';

export interface InvestorPortfolioTableProps {
  assets: PortfolioAsset[];
  onTransferClick: (asset: PortfolioAsset) => void;
}

export default function InvestorPortfolioTable({
  assets,
  onTransferClick,
}: InvestorPortfolioTableProps) {
  const unavailableAssets = useMemo(
    () => assets.filter((asset) => !asset.isDataAvailable),
    [assets],
  );
  const availableAssets = useMemo(
    () => assets.filter((asset) => asset.isDataAvailable),
    [assets],
  );

  return (
    <div className="space-y-6">
      {availableAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onTransferClick={() => onTransferClick(asset)}
            />
          ))}
        </div>
      ) : (
        <PortfolioEmptyState />
      )}

      {unavailableAssets.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">
            Unavailable holdings ({unavailableAssets.length})
          </h3>
          <p className="text-xs text-amber-700 mb-3">
            These assets appear on-chain but metadata/compliance records could not be
            resolved. Balances are shown for information only.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unavailableAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border border-amber-100 bg-white p-4 text-sm text-slate-700"
              >
                <div className="font-medium">{asset.name}</div>
                <div className="text-xs text-slate-500">{asset.ticker}</div>
                <div className="mt-2 text-xs text-amber-700">
                  {asset.balance.toLocaleString('en-US')} {asset.ticker}
                </div>
                <div className="mt-1 text-xs text-amber-700">
                  Metadata temporarily unavailable
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
