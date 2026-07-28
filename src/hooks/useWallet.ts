import { create } from 'zustand';
import { isConnected, requestAccess, getNetwork } from '@stellar/freighter-api';

interface WalletState {
address: string | null;
network: string | null;
isConnecting: boolean;
connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  network: null,
  isConnecting: false,

  connect: async () => {
    set({ isConnecting: true });
    try {
      if (await isConnected()) {
        const access = await requestAccess();
        const networkDetails = await getNetwork();

        // TODO: implement wallet auto-reconnect on page refresh
        set({
          address: access,
          network: networkDetails,
          isConnecting: false
        });
      } else {
        alert("Please install Freighter wallet!");
        set({ isConnecting: false });
      }
    } catch (error) {
      console.error("Wallet connection failed", error);
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    set({ address: null, network: null });
  }
}));