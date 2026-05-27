import { create } from "zustand";

interface NetworkState {
  isRealOnline: boolean;
  isSimulatedOffline: boolean;
  setRealOnline: (isOnline: boolean) => void;
  toggleSimulatedOffline: () => void;
  isOnline: () => boolean;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isRealOnline: true,
  isSimulatedOffline: false,

  setRealOnline: (isRealOnline) => set({ isRealOnline }),
  toggleSimulatedOffline: () => set((state) => ({ 
    isSimulatedOffline: !state.isSimulatedOffline 
  })),

  // Computes the active network state considering the manual simulation switch
  isOnline: () => {
    const { isRealOnline, isSimulatedOffline } = get();
    return isRealOnline && !isSimulatedOffline;
  },
}));
