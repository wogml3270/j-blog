import { create } from "zustand";
import type { AdminEntityScope } from "@/types/admin";

type SelectionMap = Record<AdminEntityScope, string | null>;

type AdminDetailState = {
  selected: SelectionMap;
  open: (scope: AdminEntityScope, id: string) => void;
  close: (scope: AdminEntityScope) => void;
};

const INITIAL_SELECTION: SelectionMap = {
  blog: null,
  projects: null,
  contact: null,
};

export const useAdminDetailStore = create<AdminDetailState>((set) => ({
  selected: INITIAL_SELECTION,
  open: (scope, id) =>
    set((state) => ({
      selected: {
        ...state.selected,
        [scope]: id,
      },
    })),
  close: (scope) =>
    set((state) => ({
      selected: {
        ...state.selected,
        [scope]: null,
      },
    })),
}));
