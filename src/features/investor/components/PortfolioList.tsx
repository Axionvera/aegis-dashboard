import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import AssetCard from '@/features/assets/components/AssetCard';
import AssetCardSkeleton from '@/features/assets/components/AssetCardSkeleton';
import type { PortfolioAsset } from '@/lib/aegis/types';
import { usePortfolio } from '../hooks/usePortfolio';
import { EmptyState } from '@/components/states';
import PortfolioDisclaimer from './PortfolioDisclaimer';
import TransferModal from './TransferModal';
import InvestorPortfolioTable from './InvestorPortfolioTable';

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
    if (failure) {
      return (
        <EmptyState
          icon={undefined}
          title="Portfolio unavailable"
          description={error ?? 'Unable to load your portfolio right now.'}
          variant="unavailable"
          actions={[
            {
              label: 'Retry',
              onClick: refetch,
              variant: 'primary',
            },
          ]}
        />
      );
    }
    return (
      <EmptyState
        icon={undefined}
        title="Portfolio unavailable"
        description={error ?? 'Unable to load your portfolio right now.'}
        variant="unavailable"
        actions={[
          {
            label: 'Try again',
            onClick: refetch,
            variant: 'primary',
          },
        ]}
      />
    );
  }

  return (
    <div>
      <InvestorPortfolioTable assets={assets} onTransferClick={setActiveAsset} />
      <PortfolioDisclaimer />
      {activeAsset && <TransferModal asset={activeAsset} onClose={() => setActiveAsset(null)} />}
    </div>
  );
}
