import { create } from "zustand";

type PublicUiState = {
  isAuthModalOpen: boolean;
  isContactModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openContactModal: () => void;
  closeContactModal: () => void;
};

export const usePublicUiStore = create<PublicUiState>((set) => ({
  isAuthModalOpen: false,
  isContactModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openContactModal: () => set({ isContactModalOpen: true }),
  closeContactModal: () => set({ isContactModalOpen: false }),
}));
