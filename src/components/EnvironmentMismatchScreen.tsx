import { AlertTriangle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import type { EnvironmentMismatchResult } from '@/lib/environment';

interface EnvironmentMismatchScreenProps {
  result: EnvironmentMismatchResult;
}

export default function EnvironmentMismatchScreen({ result }: EnvironmentMismatchScreenProps) {
  const { disconnect } = useWallet();

  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-4" role="alert" aria-live="polite">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{result.title}</h2>
        <p className="text-slate-600">{result.message}</p>

        {result.walletNetwork && (
          <p className="text-sm text-slate-500 mt-4">
            Current network: {result.walletNetwork}
          </p>
        )}
        <p className="text-sm text-slate-500 mt-1">
          Expected network: {result.targetNetwork}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={disconnect}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2 rounded-md font-medium transition"
          >
            Disconnect wallet
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          This is a protocol-level network check. It does not make a legal or compliance
          determination about your wallet or jurisdiction.
        </p>
      </div>
    </div>
  );
}
