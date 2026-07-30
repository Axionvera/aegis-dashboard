import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { NETWORK_GUARD_DISCLAIMER } from '../networkGuard';
import type { NetworkGuardResult } from '../types';

interface NetworkGuardNoticeProps {
  guard: NetworkGuardResult;
  /**
   * Hides the "Recheck network" button for surfaces that already poll or that
   * cannot afford another wallet call (e.g. a row rendered many times).
   */
  hideRecheck?: boolean;
}

/**
 * Inline notice explaining why the wallet network stops or qualifies an action.
 *
 * Renders nothing when the guard allows the action, so callers can drop it into
 * a form unconditionally. `evaluateNetworkGuard` owns the block-versus-warn
 * decision; this only draws the outcome.
 */
export default function NetworkGuardNotice({ guard, hideRecheck = false }: NetworkGuardNoticeProps) {
  const refreshNetwork = useWallet((s) => s.refreshNetwork);
  const [isRechecking, setIsRechecking] = useState(false);

  if (guard.decision === 'allow') return null;

  const blocked = guard.decision === 'block';
  const Icon = blocked ? ShieldAlert : AlertTriangle;

  const handleRecheck = async () => {
    setIsRechecking(true);
    try {
      await refreshNetwork();
    } finally {
      setIsRechecking(false);
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-lg border p-4 ${
        blocked ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex gap-3">
        <Icon
          size={20}
          className={`mt-0.5 shrink-0 ${blocked ? 'text-red-600' : 'text-amber-600'}`}
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-2">
          <h4 className={`font-semibold ${blocked ? 'text-red-900' : 'text-amber-900'}`}>
            {guard.title}
          </h4>
          <p className={`text-sm ${blocked ? 'text-red-800' : 'text-amber-800'}`}>{guard.message}</p>
          <p className={`text-sm font-medium ${blocked ? 'text-red-900' : 'text-amber-900'}`}>
            {guard.guidance}
          </p>

          <dl className="space-y-1 text-xs text-slate-600">
            <div className="flex gap-2">
              <dt className="font-medium">Dashboard network:</dt>
              <dd>{guard.targetNetwork}</dd>
            </div>
            {guard.walletNetwork && (
              <div className="flex gap-2">
                <dt className="font-medium">Wallet network:</dt>
                <dd>{guard.walletNetwork}</dd>
              </div>
            )}
          </dl>

          {!hideRecheck && (
            <button
              type="button"
              onClick={handleRecheck}
              disabled={isRechecking}
              className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={isRechecking ? 'animate-spin' : undefined}
                aria-hidden="true"
              />
              {isRechecking ? 'Checking…' : 'Recheck network'}
            </button>
          )}

          <p className="text-xs text-slate-500">{NETWORK_GUARD_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
