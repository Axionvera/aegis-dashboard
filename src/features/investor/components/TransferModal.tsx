import { useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import { useWallet } from '@/hooks/useWallet';
import { formatAmount, truncateAddress } from '@/utils/formatting';
import TransactionReview from '@/components/transactions/TransactionReview';
import TransactionProgress from '@/components/transactions/TransactionProgress';
import TransactionReceipt from '@/components/transactions/TransactionReceipt';
import { mapToTransactionResult } from '@/components/transactions/statusMapper';
import { getExplorerUrl } from '@/components/transactions/explorerLink';
import type {
  TransactionDetails,
  TransactionResult,
  TransactionState,
} from '@/components/transactions/types';
import type { PortfolioAsset } from '@/lib/aegis/types';

interface TransferModalProps {
  asset: PortfolioAsset;
  onClose: () => void;
}

export default function TransferModal({ asset, onClose }: TransferModalProps) {
  const { checkWhitelist, transfer, isLoading } = useAegis();
  const { address, network } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState<TransactionState>('idle');
  const [result, setResult] = useState<TransactionResult | null>(null);

  // Re-check eligibility here too: the card's disabled button is the primary
  // guard, but this modal can be reached via any future entry point, so it
  // must not assume the caller already validated eligibility.
  const isEligible = asset.isDataAvailable && asset.transferEligibility.state === 'eligible';

  // Pasted Stellar addresses often carry surrounding whitespace, which would
  // otherwise reach the compliance check and the transaction itself.
  const cleanRecipient = recipient.trim();

  const details: TransactionDetails = {
    action: 'transfer',
    title: `Transfer ${asset.ticker}`,
    description: 'Review the details before signing this transfer.',
    network: network ?? undefined,
    rows: [
      { label: 'Asset', value: asset.ticker },
      { label: 'Amount', value: `${formatAmount(parseFloat(amount) || 0)} ${asset.ticker}` },
      { label: 'Recipient', value: cleanRecipient, mono: true },
      ...(address
        ? [{ label: 'From', value: truncateAddress(address), mono: true }]
        : []),
      { label: 'Network', value: network ?? 'Unknown' },
    ],
  };

  const handleReview = async () => {
    setError('');
    if (!cleanRecipient || !amount) return setError('Fill all fields');

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return setError('Enter a valid amount.');
    }
    if (numericAmount > asset.balance) {
      return setError('Amount exceeds your available balance.');
    }

    // Compliance Check
    const isCompliant = await checkWhitelist(cleanRecipient);
    if (!isCompliant) {
      return setError('Recipient is not KYC whitelisted.');
    }

    setState('review');
  };

  const handleConfirm = async () => {
    setState('signing');
    try {
      setResult(
        mapToTransactionResult(
          await transfer(cleanRecipient, parseFloat(amount), setState),
        ),
      );
    } catch (err) {
      setResult(mapToTransactionResult(err));
    }
  };

  const renderBody = () => {
    if (!isEligible) {
      return (
        <>
          <h2 className="text-xl font-bold mb-4">Transfer {asset.ticker}</h2>
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
      );
    }

    if (result) {
      return (
        <TransactionReceipt
          result={result}
          details={details}
          onClose={onClose}
          explorerUrl={getExplorerUrl(result.txHash, network)}
        />
      );
    }

    if (state === 'signing' || state === 'pending') {
      return <TransactionProgress state={state} />;
    }

    if (state === 'review') {
      return (
        <TransactionReview
          details={details}
          onConfirm={handleConfirm}
          onCancel={() => setState('idle')}
        />
      );
    }

    return (
      <>
        <h2 className="text-xl font-bold mb-4">Transfer {asset.ticker}</h2>

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
            onClick={handleReview}
            disabled={isLoading}
            className="flex-1 bg-aegis-brand hover:bg-blue-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Review Transfer'}
          </button>
        </div>
      </>
    );
  };

  // The overlay scrolls, not the panel: content taller than the viewport stays
  // reachable, and shorter content stays vertically centred.
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg w-full max-w-md">
          {renderBody()}
        </div>
      </div>
    </div>
  );
}
