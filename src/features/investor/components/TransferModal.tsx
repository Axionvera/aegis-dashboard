import { useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import type { PortfolioAsset } from '@/lib/aegis/types';

interface TransferModalProps {
  asset: PortfolioAsset;
  onClose: () => void;
}

export default function TransferModal({ asset, onClose }: TransferModalProps) {
  const { checkWhitelist, transfer, isLoading } = useAegis();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Re-check eligibility here too: the card's disabled button is the primary
  // guard, but this modal can be reached via any future entry point, so it
  // must not assume the caller already validated eligibility.
  const isEligible = asset.isDataAvailable && asset.transferEligibility.state === 'eligible';

  const handleTransfer = async () => {
    setError('');
    if (!recipient || !amount) return setError('Fill all fields');

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return setError('Enter a valid amount.');
    }
    if (numericAmount > asset.balance) {
      return setError('Amount exceeds your available balance.');
    }

    const isCompliant = await checkWhitelist(recipient);
    if (!isCompliant) {
      return setError('Recipient is not KYC whitelisted.');
    }

    try {
      await transfer(recipient, numericAmount);
      alert('Transfer Successful!');
      onClose();
    } catch (err) {
      setError('Transaction failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Transfer {asset.ticker}</h2>

        {!isEligible ? (
          <>
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
              This asset is not currently eligible for transfer.
              {asset.transferEligibility.reasons[0] ? ` ${asset.transferEligibility.reasons[0]}` : ''}
            </div>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-medium transition"
            >
              Close
            </button>
          </>
        ) : (
          <>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Address</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
                  placeholder="GABC..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount <span className="text-slate-400 font-normal">(max {asset.balance})</span>
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={isLoading}
                className="flex-1 bg-aegis-brand hover:bg-blue-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
