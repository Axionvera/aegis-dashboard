import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import AssetCard from '@/features/assets/components/AssetCard';
import AssetCardSkeleton from '@/features/assets/components/AssetCardSkeleton';
import type { PortfolioAsset } from '@/lib/aegis/types';
import { usePortfolio } from '../hooks/usePortfolio';
import PortfolioEmptyState from './PortfolioEmptyState';
import PortfolioErrorState from './PortfolioErrorState';
import PortfolioDisclaimer from './PortfolioDisclaimer';
import TransferModal from './TransferModal';

const SKELETON_COUNT = 3;

export default function PortfolioList() {
  const { address } = useWallet();
  const { status, assets, error, failure, refetch } = usePortfolio(address);
  const [activeAsset, setActiveAsset] = useState<PortfolioAsset | null>(null);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <AssetCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <PortfolioErrorState
        message={error ?? 'Unable to load your portfolio right now.'}
        failure={failure}
        onRetry={refetch}
      />
    );
  }

  if (assets.length === 0) {
    return <PortfolioEmptyState />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} onTransferClick={() => setActiveAsset(asset)} />
        ))}
      </div>

      <PortfolioDisclaimer />

      {activeAsset && <TransferModal asset={activeAsset} onClose={() => setActiveAsset(null)} />}
    </div>
  );
}
