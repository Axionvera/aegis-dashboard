import { useState } from 'react';
import AssetCard from './AssetCard';
import TransferModal from './TransferModal';
import { ComplianceStatus } from '@/types/compliance';

export default function PortfolioList() {
  const [activeTransfer, setActiveTransfer] = useState<string | null>(null);

  const mockAssets: Array<{
    id: string;
    name: string;
    ticker: string;
    balance: number;
    complianceStatus: ComplianceStatus;
  }> = [
    { id: '1', name: 'Manhattan Commercial Real Estate', ticker: 'NY-CRE', balance: 50.5, complianceStatus: 'approved' },
    { id: '2', name: 'US Treasury Bill 6-Mo', ticker: 'UST-6M', balance: 10000.00, complianceStatus: 'pending' },
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
            complianceStatus={asset.complianceStatus}
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
