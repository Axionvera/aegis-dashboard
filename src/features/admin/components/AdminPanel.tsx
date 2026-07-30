import { useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import { useWallet } from '@/hooks/useWallet';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import TransactionReview from '@/components/transactions/TransactionReview';
import TransactionProgress from '@/components/transactions/TransactionProgress';
import { mapToTransactionResult } from '@/components/transactions/statusMapper';
import { buildMintSummary } from '@/components/transactions/operationSummary';
import {
  AdminActionReceiptView,
  mapAdminActionReceipt,
} from '@/features/admin/receipts';
import { CheckCircle } from 'lucide-react';
import type {
  TransactionResult,
  TransactionState,
} from '@/components/transactions/types';
import MintWorkflow from '@/features/minting/components/MintWorkflow';

const MINT_AMOUNT = 1000;

/**
 * Legacy fixed-amount mint path kept behind `newMintFlow=false` for rollback.
 * Prefer MintWorkflow (issue #6) when the flag is enabled.
 */
function LegacyMintPanel() {
  const { mint, isLoading } = useAegis();
  const { network } = useWallet();
  const [address, setAddress] = useState('');
  const [state, setState] = useState<TransactionState>('idle');
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [whitelistMessage, setWhitelistMessage] = useState<string | null>(null);

  const cleanAddress = address.trim();

  const details = buildMintSummary({
    amount: MINT_AMOUNT,
    recipient: cleanAddress,
    network,
  });

  const handleWhitelist = async () => {
    // TODO: replace with a real contract.whitelist(address) call once the SDK is live.
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

  if (result) {
    const receipt = mapAdminActionReceipt({
      operation: 'mint',
      target: cleanAddress,
      outcome: result,
      network,
      metadata: { amount: MINT_AMOUNT.toLocaleString('en-US') },
    });

    return (
      <AdminActionReceiptView
        receipt={receipt}
        onNextAction={reset}
        onClose={reset}
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
            type="button"
            onClick={handleWhitelist}
            disabled={isLoading || !cleanAddress}
            className="flex-1 bg-aegis-accent hover:bg-emerald-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
          >
            Whitelist User
          </button>
          <button
            type="button"
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
}

export default function AdminPanel() {
  const newMintFlow = useFeatureFlags((s) => s.flags.newMintFlow);

  if (newMintFlow) {
    return <MintWorkflow />;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <LegacyMintPanel />
    </div>
  );
}
