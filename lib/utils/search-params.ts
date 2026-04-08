import type { AdminListFilter } from "@/types/admin";

export function pickSingleQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

const ADMIN_LIST_FILTER_SET = new Set<AdminListFilter>([
  "all",
  "main",
  "general",
  "published",
  "draft",
]);

// 관리자 리스트 필터 문자열을 허용된 값으로 정규화한다.
export function normalizeAdminListFilter(raw: string | null | undefined): AdminListFilter {
  if (!raw) {
    return "all";
  }

  return ADMIN_LIST_FILTER_SET.has(raw as AdminListFilter) ? (raw as AdminListFilter) : "all";
}
