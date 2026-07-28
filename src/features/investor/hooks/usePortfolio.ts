import { useCallback, useEffect, useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import { buildRecoveryPlan, classifySdkError } from '@/features/sdk-recovery';
import type { ClassifiedSdkError, RecoveryPlan } from '@/features/sdk-recovery';
import type { PortfolioAsset } from '@/lib/aegis/types';

export type PortfolioStatus = 'idle' | 'loading' | 'error' | 'ready';

export interface PortfolioFailure {
  error: ClassifiedSdkError;
  plan: RecoveryPlan;
}

interface UsePortfolioResult {
  status: PortfolioStatus;
  assets: PortfolioAsset[];
  /** Plain message, kept for callers that only need one line of text. */
  error: string | null;
  /** Classified failure and its recovery plan, when the load failed. */
  failure: PortfolioFailure | null;
  refetch: () => void;
}

/**
 * Loads the connected investor's holdings from the Aegis SDK read model.
 * `idle` means there is no address to query yet (e.g. wallet disconnected);
 * callers are expected to gate rendering on that separately.
 */
export function usePortfolio(investorAddress: string | null): UsePortfolioResult {
  const { getPortfolio } = useAegis();
  const [status, setStatus] = useState<PortfolioStatus>('idle');
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<PortfolioFailure | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!investorAddress) {
      setStatus('idle');
      setAssets([]);
      setError(null);
      setFailure(null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);
    setFailure(null);

    getPortfolio(investorAddress)
      .then((result) => {
        if (cancelled) return;
        setAssets(result.assets);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Reads have no side effects, so the plan here is purely about telling
        // the user whether waiting, reconnecting, or reporting is the next step.
        const classified = classifySdkError(err, { walletConnected: Boolean(investorAddress) });
        setFailure({ error: classified, plan: buildRecoveryPlan(classified) });
        setError(classified.detail ?? classified.message);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // getPortfolio is re-created every render by useAegis; only the address
    // and an explicit refetch should trigger a new fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorAddress, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { status, assets, error, failure, refetch };
}
