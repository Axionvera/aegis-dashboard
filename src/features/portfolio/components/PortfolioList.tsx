import { useState } from 'react';
import AssetCard from './AssetCard';
import TransferModal from './TransferModal';

export default function PortfolioList() {
  // TODO: add skeleton loading states for asset fetching
  const [activeTransfer, setActiveTransfer] = useState<string | null>(null);

  // Mock Data
  const mockAssets = [
    { id: '1', name: 'Manhattan Commercial Real Estate', ticker: 'NY-CRE', balance: 50.5 },
    { id: '2', name: 'US Treasury Bill 6-Mo', ticker: 'UST-6M', balance: 10000.00 }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAssets.map(asset => (
          <AssetCard
            key={asset.id}
            name={asset.name}
            ticker={asset.ticker}
            balance={asset.balance}
            onTransferClick={() => setActiveTransfer(asset.ticker)}
          />
        ))}
      </div>

      {activeTransfer && (
        <TransferModal
          ticker={activeTransfer}
          onClose={() => setActiveTransfer(null)}
        />
      )}
    </div>
  );
}