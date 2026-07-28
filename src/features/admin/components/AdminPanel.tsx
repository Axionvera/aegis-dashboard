import { useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import { useWallet } from '@/hooks/useWallet';
import { formatAmount } from '@/utils/formatting';
import TransactionReview from '@/components/transactions/TransactionReview';
import TransactionProgress from '@/components/transactions/TransactionProgress';
import TransactionReceipt from '@/components/transactions/TransactionReceipt';
import { mapToTransactionResult } from '@/components/transactions/statusMapper';
import { getExplorerUrl } from '@/components/transactions/explorerLink';
import { CheckCircle } from 'lucide-react';
import type {
  TransactionDetails,
  TransactionResult,
  TransactionState,
} from '@/components/transactions/types';

const MINT_AMOUNT = 1000;

export default function AdminPanel() {
  const { mint, isLoading } = useAegis();
  const { network } = useWallet();
  const [address, setAddress] = useState('');
  const [state, setState] = useState<TransactionState>('idle');
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [whitelistMessage, setWhitelistMessage] = useState<string | null>(null);

  // Pasted Stellar addresses often carry surrounding whitespace.
  const cleanAddress = address.trim();

  const details: TransactionDetails = {
    action: 'mint',
    title: 'Mint asset',
    description: 'This issues new supply directly to the target address.',
    network: network ?? undefined,
    rows: [
      { label: 'Amount', value: formatAmount(MINT_AMOUNT) },
      { label: 'Target address', value: cleanAddress, mono: true },
      { label: 'Network', value: network ?? 'Unknown' },
    ],
  };

  const handleWhitelist = async () => {
    // TODO: replace with a real contract.whitelist(address) call once the SDK is live.
    // For now, show an inline confirmation instead of a blocking alert().
    setWhitelistMessage(`Address ${cleanAddress} has been submitted for whitelisting.`);
    setTimeout(() => setWhitelistMessage(null), 4000);
  };

  const handleConfirmMint = async () => {
    setState('signing');
    try {
      setResult(
        mapToTransactionResult(await mint(cleanAddress, MINT_AMOUNT, setState)),
      );
    } catch (err) {
      setResult(mapToTransactionResult(err));
    }
  };

  const reset = () => {
    setResult(null);
    setState('idle');
    setWhitelistMessage(null);
  };

  const renderBody = () => {
    if (result) {
      return (
        <TransactionReceipt
          result={result}
          details={details}
          onClose={reset}
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
          onConfirm={handleConfirmMint}
          onCancel={reset}
        />
      );
    }

    return (
      <>
        <h2 className="text-xl font-bold mb-6">Admin Controls</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="admin-target-address" className="block text-sm font-medium text-slate-700 mb-1">
              Target Address
            </label>
            <input
              id="admin-target-address"
              type="text"
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
              placeholder="GABC…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Inline whitelist confirmation — replaces the removed alert() */}
          {whitelistMessage && (
            <div
              role="status"
              className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2"
            >
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {whitelistMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-0 sm:space-x-4">
            <button
              onClick={handleWhitelist}
              disabled={isLoading || !cleanAddress}
              className="flex-1 bg-aegis-accent hover:bg-emerald-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
            >
              Whitelist User
            </button>
            <button
              onClick={() => setState('review')}
              disabled={isLoading || !cleanAddress}
              className="flex-1 bg-aegis-dark hover:bg-slate-800 text-white py-2 rounded font-medium transition disabled:opacity-50"
            >
              Mint Asset
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {renderBody()}
    </div>
  );
}
