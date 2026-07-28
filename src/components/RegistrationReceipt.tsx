/**
 * RegistrationReceipt – shown after the registration transaction completes.
 * Handles both the success state (with tx details) and the error state.
 */

import Link from 'next/link';
import { CheckCircle, XCircle, ExternalLink, RotateCcw } from 'lucide-react';
import type { RegisterAssetResult } from '@/lib/aegisSdk';

// ---------------------------------------------------------------------------
// Success receipt
// ---------------------------------------------------------------------------

interface SuccessReceiptProps {
  result: RegisterAssetResult;
  assetName: string;
  ticker: string;
}

export function SuccessReceipt({ result, assetName, ticker }: SuccessReceiptProps) {
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result.txHash}`;
  const ledgerDate = new Date(result.ledgerTimestamp).toLocaleString();

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <CheckCircle className="text-aegis-accent" size={56} strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-slate-900">Asset Registered!</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          <span className="font-semibold text-slate-700">{assetName}</span> ({ticker}) has been
          successfully anchored on the Stellar network.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-left space-y-3">
        <Detail label="Transaction Hash" value={result.txHash} mono />
        <Detail label="Asset Contract ID" value={result.assetContractId} mono />
        <Detail label="Ledger Timestamp" value={ledgerDate} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-aegis-brand hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
        >
          View on Explorer <ExternalLink size={14} />
        </a>
        <Link
          href="/register-asset"
          className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-medium text-sm transition"
        >
          Register Another
        </Link>
        <Link
          href="/portfolio"
          className="inline-flex items-center justify-center gap-2 bg-aegis-dark hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
        >
          Go to Portfolio
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error receipt
// ---------------------------------------------------------------------------

interface ErrorReceiptProps {
  message: string;
  onRetry: () => void;
}

export function ErrorReceipt({ message, onRetry }: ErrorReceiptProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <XCircle className="text-red-500" size={56} strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-slate-900">Registration Failed</h2>
        <p className="text-slate-500 text-sm max-w-sm">{message}</p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 bg-aegis-brand hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition"
      >
        <RotateCcw size={14} />
        Try Again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p
        className={`text-sm text-slate-800 break-all ${mono ? 'font-mono text-xs' : 'font-semibold'}`}
      >
        {value}
      </p>
    </div>
  );
}
