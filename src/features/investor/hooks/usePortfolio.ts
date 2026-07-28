import { useCallback, useEffect, useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import type { PortfolioAsset } from '@/lib/aegis/types';

export type PortfolioStatus = 'idle' | 'loading' | 'error' | 'ready';

interface UsePortfolioResult {
  status: PortfolioStatus;
  assets: PortfolioAsset[];
  error: string | null;
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
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!investorAddress) {
      setStatus('idle');
      setAssets([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    getPortfolio(investorAddress)
      .then((result) => {
        if (cancelled) return;
        setAssets(result.assets);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to load your portfolio right now.');
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

  return { status, assets, error, refetch };
}
