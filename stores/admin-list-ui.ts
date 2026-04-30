import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ADMIN_PAGE_SIZE_OPTIONS, DEFAULT_ADMIN_PAGE_SIZE } from "@/lib/utils/pagination";
import type { AdminListSort } from "@/types/admin";

type AdminListScope = "blog" | "projects" | "contact";
type PageSizeOption = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number];

type PageSizeMap = Record<AdminListScope, PageSizeOption>;
type SearchQueryMap = Record<Extract<AdminListScope, "blog" | "projects">, string>;
type SortMap = Record<Extract<AdminListScope, "blog" | "projects">, AdminListSort>;

type AdminListUiState = {
  pageSizeByScope: PageSizeMap;
  searchQueryByScope: SearchQueryMap;
  sortByScope: SortMap;
  setPageSize: (scope: AdminListScope, pageSize: number) => void;
  setSearchQuery: (scope: "blog" | "projects", query: string) => void;
  setSort: (scope: "blog" | "projects", sort: AdminListSort) => void;
};

const DEFAULT_PAGE_SIZE_MAP: PageSizeMap = {
  blog: DEFAULT_ADMIN_PAGE_SIZE,
  projects: DEFAULT_ADMIN_PAGE_SIZE,
  contact: DEFAULT_ADMIN_PAGE_SIZE,
};

const DEFAULT_SEARCH_QUERY_MAP: SearchQueryMap = {
  blog: "",
  projects: "",
};

const DEFAULT_SORT_MAP: SortMap = {
  blog: "updated",
  projects: "updated",
};

function toPageSize(value: number): PageSizeOption {
  return ADMIN_PAGE_SIZE_OPTIONS.includes(value as PageSizeOption)
    ? (value as PageSizeOption)
    : DEFAULT_ADMIN_PAGE_SIZE;
}

function toAdminListSort(value: string): AdminListSort {
  if (value === "name" || value === "created" || value === "updated") {
    return value;
  }

  return "updated";
}

export const useAdminListUiStore = create<AdminListUiState>()(
  persist(
    (set) => ({
      pageSizeByScope: DEFAULT_PAGE_SIZE_MAP,
      searchQueryByScope: DEFAULT_SEARCH_QUERY_MAP,
      sortByScope: DEFAULT_SORT_MAP,
      // 관리자 탭별 표시 개수는 로컬 스토리지에 저장해 재진입 시 복원한다.
      setPageSize: (scope, pageSize) =>
        set((state) => ({
          pageSizeByScope: {
            ...state.pageSizeByScope,
            [scope]: toPageSize(pageSize),
          },
        })),
      // 관리자 리스트 검색어를 탭별로 저장해 재진입 시 입력값을 복원한다.
      setSearchQuery: (scope, query) =>
        set((state) => ({
          searchQueryByScope: {
            ...state.searchQueryByScope,
            [scope]: query,
          },
        })),
      // 관리자 리스트 정렬 기준을 탭별로 저장해 재진입 시 선택값을 복원한다.
      setSort: (scope, sort) =>
        set((state) => ({
          sortByScope: {
            ...state.sortByScope,
            [scope]: toAdminListSort(sort),
          },
        })),
    }),
    {
      name: "admin-list-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pageSizeByScope: state.pageSizeByScope,
        searchQueryByScope: state.searchQueryByScope,
        sortByScope: state.sortByScope,
      }),
    },
  ),
);
