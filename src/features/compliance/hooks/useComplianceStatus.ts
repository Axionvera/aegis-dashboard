import { useCallback, useEffect, useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import {
  mapAddressComplianceStatus,
  unavailableComplianceStatus,
} from '@/features/compliance/statusMap';
import type { AddressComplianceStatus } from '@/features/compliance/types';

export type ComplianceStatusLoadState = 'idle' | 'loading' | 'ready' | 'error';

interface UseComplianceStatusResult {
  status: ComplianceStatusLoadState;
  record: AddressComplianceStatus | null;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads address-level compliance status through the centralised Aegis SDK
 * provider and maps it into the panel-safe model.
 */
export function useComplianceStatus(
  address: string | null,
): UseComplianceStatusResult {
  const { getAddressCompliance } = useAegis();
  const [status, setStatus] = useState<ComplianceStatusLoadState>('idle');
  const [record, setRecord] = useState<AddressComplianceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!address) {
      setStatus('idle');
      setRecord(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    getAddressCompliance(address)
      .then((raw) => {
        if (cancelled) return;
        setRecord(mapAddressComplianceStatus(raw, 'sdk'));
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load compliance status right now.';
        setError(message);
        setRecord(unavailableComplianceStatus(address, message));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // getAddressCompliance is recreated each render by useAegis; only address /
    // explicit refetch should trigger a new request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { status, record, error, refetch };
}
