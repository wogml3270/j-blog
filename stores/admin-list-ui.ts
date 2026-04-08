import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ADMIN_PAGE_SIZE_OPTIONS, DEFAULT_ADMIN_PAGE_SIZE } from "@/lib/utils/pagination";

type AdminListScope = "blog" | "projects" | "contact";
type PageSizeOption = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number];

type PageSizeMap = Record<AdminListScope, PageSizeOption>;

type AdminListUiState = {
  pageSizeByScope: PageSizeMap;
  setPageSize: (scope: AdminListScope, pageSize: number) => void;
};

const DEFAULT_PAGE_SIZE_MAP: PageSizeMap = {
  blog: DEFAULT_ADMIN_PAGE_SIZE,
  projects: DEFAULT_ADMIN_PAGE_SIZE,
  contact: DEFAULT_ADMIN_PAGE_SIZE,
};

function toPageSize(value: number): PageSizeOption {
  return ADMIN_PAGE_SIZE_OPTIONS.includes(value as PageSizeOption)
    ? (value as PageSizeOption)
    : DEFAULT_ADMIN_PAGE_SIZE;
}

export const useAdminListUiStore = create<AdminListUiState>()(
  persist(
    (set) => ({
      pageSizeByScope: DEFAULT_PAGE_SIZE_MAP,
      // 관리자 탭별 표시 개수는 로컬 스토리지에 저장해 재진입 시 복원한다.
      setPageSize: (scope, pageSize) =>
        set((state) => ({
          pageSizeByScope: {
            ...state.pageSizeByScope,
            [scope]: toPageSize(pageSize),
          },
        })),
    }),
    {
      name: "admin-list-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ pageSizeByScope: state.pageSizeByScope }),
    },
  ),
);
