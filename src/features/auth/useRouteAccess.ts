import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { RouteAccessResult } from '@/features/auth/types';
import { evaluateRouteAccess } from '@/lib/route-guard';
import { useWallet } from '@/hooks/useWallet';

export const useRouteAccess = (path: string): RouteAccessResult => {
  const { address } = useWallet();
  const role = useAuthStore((state) => state.role);
  const isRoleLoading = useAuthStore((state) => state.isRoleLoading);
  const loadRoleForWallet = useAuthStore((state) => state.loadRoleForWallet);
  const clearRole = useAuthStore((state) => state.clearRole);

  useEffect(() => {
    if (!address) {
      clearRole();
      return;
    }

    loadRoleForWallet(address);
  }, [address, clearRole, loadRoleForWallet]);

  return evaluateRouteAccess({
    path,
    walletAddress: address,
    role,
    isRoleLoading,
  });
};
