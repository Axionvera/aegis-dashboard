import { useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import { useWallet } from '@/hooks/useWallet';
import TransactionReview from '@/components/transactions/TransactionReview';
import TransactionProgress from '@/components/transactions/TransactionProgress';
import { mapToTransactionResult } from '@/components/transactions/statusMapper';
import { getExplorerUrl } from '@/components/transactions/explorerLink';
import { buildMintSummary } from '@/components/transactions/operationSummary';
import {
  AdminActionReceiptView,
  mapAdminActionReceipt,
} from '@/features/admin/receipts';
import type {
  RawTransactionOutcome,
  TransactionResult,
  TransactionState,
} from '@/components/transactions/types';
import { useIdempotentSubmit } from '@/features/forms/idempotency';
import { FormError } from '@/features/forms/validation';
import { validateMintRequest, MINT_ERROR_MESSAGES } from '@/lib/mintRequest';
import {
  buildRecoveryPlan,
  classifySdkError,
  SdkErrorRecovery,
  type ClassifiedSdkError,
  type RecoveryPlan,
} from '@/features/sdk-recovery';
import {
  findMintableAsset,
  mintableAssetsFixture,
  type MintableAsset,
} from '@/features/minting/fixtures';

interface MintWorkflowProps {
  /** Optional override for the mintable asset catalogue (tests). */
  assets?: MintableAsset[];
  /** Called when the user finishes a successful mint and chooses to start over. */
  onComplete?: () => void;
}

/**
 * Guided admin minting workflow: select asset → enter recipient & amount →
 * compliance pre-check → review → Freighter sign (via provider phases) →
 * receipt / recovery. Closes #6.
 */
export default function MintWorkflow({
  assets = mintableAssetsFixture,
  onComplete,
}: MintWorkflowProps) {
  const { checkWhitelist, mint, isLoading } = useAegis();
  const { address, network, connect } = useWallet();

  const [assetId, setAssetId] = useState(assets[0]?.id ?? '');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState<TransactionState>('idle');
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [failure, setFailure] = useState<{
    error: ClassifiedSdkError;
    plan: RecoveryPlan;
  } | null>(null);

  const selectedAsset = findMintableAsset(assetId) ?? assets.find((a) => a.id === assetId);
  const cleanRecipient = recipient.trim();
  const numericAmount = parseFloat(amount);

  // One key per (signer, asset, recipient, amount, network). Double-click on
  // Confirm or a recovery retry resolves to the same key and cannot produce a
  // second mint; editing any field produces a new key. See docs/form-idempotency.md.
  const submission = useIdempotentSubmit<RawTransactionOutcome>({
    scope: 'mint',
    actor: address,
    payload: {
      assetId,
      recipient: cleanRecipient,
      amount: Number.isFinite(numericAmount) ? numericAmount : null,
      network: network ?? null,
    },
  });

  const details = buildMintSummary({
    assetTicker: selectedAsset?.ticker,
    assetName: selectedAsset?.name,
    assetClass: selectedAsset?.assetClass,
    amount: Number.isFinite(numericAmount) ? numericAmount : 0,
    recipient: cleanRecipient,
    signerAddress: address,
    network,
  });

  const handleReview = async () => {
    setError('');

    const validation = validateMintRequest(
      { recipient, amount, assetId },
      { maxDecimals: selectedAsset?.decimals },
    );

    if (!validation.valid || validation.parsedAmount === undefined) {
      return setError(MINT_ERROR_MESSAGES[validation.error!]);
    }

    // Compliance pre-check before the review screen. A thrown error means the
    // check itself failed (e.g. RPC unreachable) — distinct from resolving
    // false, which means the recipient was checked and is not whitelisted.
    let isCompliant: boolean;
    try {
      isCompliant = await checkWhitelist(cleanRecipient);
    } catch {
      return setError('Could not verify compliance status. Please try again.');
    }
    if (!isCompliant) {
      return setError('Recipient is not KYC whitelisted.');
    }

    setState('review');
  };

  const handleConfirm = async () => {
    setFailure(null);
    setState('signing');

    const outcome = await submission.submit((idempotencyKey) => {
      // The mock client has no idempotency parameter yet. When the real SDK
      // accepts one, pass this key straight through.
      void idempotencyKey;
      return mint(cleanRecipient, numericAmount, setState, selectedAsset?.ticker);
    });

    if (outcome.status === 'blocked') {
      const replayed = outcome.verdict.entry?.result;
      if (outcome.verdict.decision === 'replay_result' && replayed) {
        setResult(mapToTransactionResult(replayed));
        return;
      }

      setState('pending');
      setError(outcome.verdict.message ?? '');
      return;
    }

    if (outcome.status === 'failed') {
      showRecovery(outcome.error);
      return;
    }

    const mapped = mapToTransactionResult(outcome.result);
    if (mapped.status === 'failure' || mapped.status === 'unknown') {
      showRecovery(outcome.result);
      return;
    }

    setResult(mapped);
  };

  const showRecovery = (failed: unknown) => {
    const classified = classifySdkError(failed, { walletConnected: Boolean(address) });
    const plan = buildRecoveryPlan(classified);

    setFailure({ error: classified, plan });
    setState('idle');

    if (!plan.reuseIdempotencyKey) submission.reset();
  };

  const handleEditDetails = () => {
    setFailure(null);
    setError('');
    setState('idle');
  };

  const handleReset = () => {
    setResult(null);
    setFailure(null);
    setError('');
    setState('idle');
    setRecipient('');
    setAmount('');
    onComplete?.();
  };

  const renderBody = () => {
    if (failure) {
      return (
        <>
          <h2 className="mb-4 text-xl font-bold">
            {selectedAsset ? `Mint ${selectedAsset.ticker}` : 'Mint asset'}
          </h2>
          <SdkErrorRecovery
            error={failure.error}
            plan={failure.plan}
            isBusy={submission.isSubmitting}
            explorerUrl={getExplorerUrl(failure.error.txHash, network)}
            handlers={{
              retry: handleConfirm,
              retry_with_backoff: handleConfirm,
              review_input: handleEditDetails,
              switch_network: handleEditDetails,
              connect_wallet: () => {
                void connect();
                handleEditDetails();
              },
              dismiss: handleReset,
            }}
          />
        </>
      );
    }

    if (result) {
      const receipt = mapAdminActionReceipt({
        operation: 'mint',
        target: cleanRecipient,
        outcome: result,
        network,
        metadata: {
          asset: selectedAsset
            ? `${selectedAsset.name} (${selectedAsset.ticker})`
            : undefined,
          amount: selectedAsset
            ? `${numericAmount.toLocaleString('en-US')} ${selectedAsset.ticker}`
            : numericAmount.toLocaleString('en-US'),
        },
      });

      return (
        <AdminActionReceiptView
          receipt={receipt}
          onNextAction={handleReset}
          onClose={handleReset}
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
          isSubmitting={submission.isSubmitting}
        />
      );
    }

    return (
      <>
        <h2 className="text-xl font-bold mb-2">Mint RWA asset</h2>
        <p className="text-sm text-slate-500 mb-6">
          Select an asset, enter the recipient and amount, then review before signing with Freighter.
          Recipient compliance is checked before the review screen.
        </p>

        <FormError message={error} />

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="mint-asset" className="block text-sm font-medium text-slate-700 mb-1">
              Asset
            </label>
            <select
              id="mint-asset"
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none bg-white"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.ticker} — {asset.name}
                </option>
              ))}
            </select>
            {selectedAsset && (
              <p className="mt-1 text-xs text-slate-500">
                {selectedAsset.assetClass} · up to {selectedAsset.decimals} decimal places
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mint-recipient"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Recipient address
            </label>
            <input
              id="mint-recipient"
              type="text"
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
              placeholder="GABC..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div>
            <label htmlFor="mint-amount" className="block text-sm font-medium text-slate-700 mb-1">
              Amount
              {selectedAsset ? (
                <span className="text-slate-400 font-normal"> ({selectedAsset.ticker})</span>
              ) : null}
            </label>
            <input
              id="mint-amount"
              type="number"
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="any"
            />
            <p className="mt-1 text-xs text-slate-500">
              In mock mode, amounts 0.01 / 0.02 / 0.03 simulate failure, pending, and unknown outcomes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReview}
          disabled={isLoading || submission.isSubmitting}
          className="w-full bg-aegis-dark hover:bg-slate-800 text-white py-2 rounded font-medium transition disabled:opacity-50"
        >
          {isLoading ? 'Checking compliance…' : 'Review mint'}
        </button>
      </>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {renderBody()}
    </div>
  );
}
