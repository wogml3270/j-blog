import { create } from "zustand";

export type AdminUnsavedScope = "home" | "about" | "blog" | "projects" | "contact";

type DirtyMap = Record<AdminUnsavedScope, boolean>;

type AdminUnsavedState = {
  dirtyByScope: DirtyMap;
  hasAnyDirty: boolean;
  setDirty: (scope: AdminUnsavedScope, dirty: boolean) => void;
  reset: () => void;
};

const DEFAULT_DIRTY_MAP: DirtyMap = {
  home: false,
  about: false,
  blog: false,
  projects: false,
  contact: false,
};

export const useAdminUnsavedStore = create<AdminUnsavedState>((set) => ({
  dirtyByScope: DEFAULT_DIRTY_MAP,
  hasAnyDirty: false,
  // 관리자 탭별 임시 변경 상태를 집계해 사이드바 이동 가드에서 재사용한다.
  setDirty: (scope, dirty) =>
    set((state) => {
      const nextDirtyByScope = {
        ...state.dirtyByScope,
        [scope]: dirty,
      };

      return {
        dirtyByScope: nextDirtyByScope,
        hasAnyDirty: Object.values(nextDirtyByScope).some(Boolean),
      };
    }),
  reset: () =>
    set({
      dirtyByScope: DEFAULT_DIRTY_MAP,
      hasAnyDirty: false,
    }),
}));

