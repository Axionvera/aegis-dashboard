import { create } from 'zustand';
import { resolveWalletRole } from '@/features/auth/resolveRole';
import { DashboardRole } from '@/features/auth/types';

interface AuthState {
  role: DashboardRole | null;
  isRoleLoading: boolean;
  roleError: string | null;
  setRole: (role: DashboardRole | null) => void;
  clearRole: () => void;
  loadRoleForWallet: (address: string) => Promise<DashboardRole | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  isRoleLoading: false,
  roleError: null,

  setRole: (role) => set({ role, roleError: null }),

  clearRole: () => set({ role: null, isRoleLoading: false, roleError: null }),

  loadRoleForWallet: async (address) => {
    set({ isRoleLoading: true, roleError: null });

    try {
      const role = await resolveWalletRole(address);
      set({ role, isRoleLoading: false });
      return role;
    } catch (error) {
      console.error('Role resolution failed', error);
      set({
        role: null,
        isRoleLoading: false,
        roleError: 'Unable to resolve wallet role from SDK.',
      });
      return null;
    }
  },
}));
