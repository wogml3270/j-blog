"use client";

import { Button } from "@/components/ui/button";
import { ADMIN_PAGE_SIZE_OPTIONS } from "@/lib/utils/pagination";
import { cn } from "@/lib/utils/cn";
import type { AdminPaginationProps } from "@/types/ui";

function buildPageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sortedPages = [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const current = sortedPages[index];
    const previous = sortedPages[index - 1];

    if (index > 0 && previous !== undefined) {
      if (current - previous === 2) {
        result.push(previous + 1);
      } else if (current - previous > 2) {
        result.push("ellipsis");
      }
    }

    result.push(current);
  }

  return result;
}

const PAGE_SIZE_LABELS: Record<number, string> = {
  3: "3줄씩 보기",
  5: "5줄씩 보기",
  10: "10줄씩 보기",
};

export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  pageSizeOptions = ADMIN_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: AdminPaginationProps) {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const pageItems = buildPageItems(page, totalPages);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted">
          총 {total}개 · {page} / {totalPages} 페이지
        </p>
        <label className="ml-auto inline-flex items-center gap-2 text-xs text-muted lg:ml-0">
          표시 개수
          <select
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
            aria-label="페이지 표시 개수"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {PAGE_SIZE_LABELS[option] ?? `${option}개 보기`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="flex flex-wrap items-center gap-1" aria-label="페이지 이동">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
        >
          이전
        </Button>

        {pageItems.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-8 min-w-8 items-center justify-center px-2 text-xs text-muted"
                aria-hidden
              >
                ...
              </span>
            );
          }

          const isCurrent = item === page;

          return (
            <Button
              key={`page-${item}`}
              type="button"
              size="sm"
              variant={isCurrent ? "solid" : "outline"}
              onClick={() => onPageChange(item)}
              aria-current={isCurrent ? "page" : undefined}
              className={cn("min-w-8 px-2", isCurrent && "font-semibold")}
            >
              {item}
            </Button>
          );
        })}

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          다음
        </Button>
      </nav>
    </div>
  );
}
