import type { AdminListSort, ContactListFilter } from "@/types/admin";
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

const ADMIN_LIST_SORT_SET = new Set<AdminListSort>(["name", "created", "updated"]);

// 관리자 리스트 정렬 문자열을 허용된 값으로 정규화한다.
export function normalizeAdminListSort(raw: string | null | undefined): AdminListSort {
  if (!raw) {
    return "updated";
  }

  return ADMIN_LIST_SORT_SET.has(raw as AdminListSort) ? (raw as AdminListSort) : "updated";
}

const PUBLIC_SORT_SET = new Set(["name", "date"] as const);

export type PublicListSort = "name" | "date";

// 공개 리스트 정렬 문자열을 URL 쿼리 기준으로 안전하게 정규화한다.
export function normalizePublicSort(raw: string | null | undefined): PublicListSort {
  if (!raw) {
    return "date";
  }

  return PUBLIC_SORT_SET.has(raw as PublicListSort) ? (raw as PublicListSort) : "date";
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
