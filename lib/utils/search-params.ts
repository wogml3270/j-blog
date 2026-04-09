import type { AdminListFilter, ContactListFilter } from "@/types/admin";
import type { PublishStatus } from "@/types/db";

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

// 관리자 목록의 상태 스코프(statusScope) 쿼리를 안전하게 정규화한다.
export function normalizeStatusScope(raw: string | null | undefined): PublishStatus | null {
  if (raw === "published" || raw === "draft") {
    return raw;
  }

  return null;
}

const CONTACT_LIST_FILTER_SET = new Set<ContactListFilter>(["all", "new", "replied"]);

// 문의함 상태 필터 쿼리를 허용된 값으로 정규화한다.
export function normalizeContactListFilter(raw: string | null | undefined): ContactListFilter {
  if (!raw) {
    return "all";
  }

  return CONTACT_LIST_FILTER_SET.has(raw as ContactListFilter)
    ? (raw as ContactListFilter)
    : "all";
}
