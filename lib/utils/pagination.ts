import type { PaginatedResult } from "@/types/admin";

export const ADMIN_PAGE_SIZE_OPTIONS = [3, 5, 10] as const;
export const DEFAULT_ADMIN_PAGE_SIZE = 5;
const PAGE_SIZE_SET = new Set<number>(ADMIN_PAGE_SIZE_OPTIONS);

// 페이지 번호와 크기를 서버/클라이언트에서 동일하게 정규화한다.
export function normalizePagination(
  rawPage: string | null | undefined,
  rawPageSize: string | null | undefined,
): { page: number; pageSize: number } {
  const parsedPage = Number(rawPage);
  const parsedPageSize = Number(rawPageSize);

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize =
    Number.isInteger(parsedPageSize) && PAGE_SIZE_SET.has(parsedPageSize)
      ? parsedPageSize
      : DEFAULT_ADMIN_PAGE_SIZE;

  return { page, pageSize };
}

// 총 개수 기반으로 페이지네이션 응답 메타를 안전하게 계산한다.
export function buildPaginatedResult<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): PaginatedResult<T> {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize));
  const normalizedPage = Math.min(Math.max(page, 1), totalPages);

  return {
    items,
    page: normalizedPage,
    pageSize,
    total: safeTotal,
    totalPages,
  };
}
