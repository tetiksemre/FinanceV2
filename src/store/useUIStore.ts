import { create } from 'zustand';

interface UIState {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPrivacyMode: false,
  togglePrivacyMode: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
  setPrivacyMode: (value) => set({ isPrivacyMode: value }),
}));
