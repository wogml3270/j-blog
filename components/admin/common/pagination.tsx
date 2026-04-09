"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/icons/chevron-left-icon";
import { ChevronRightIcon } from "@/components/ui/icons/chevron-right-icon";
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

export function AdminPagination({
  page,
  totalPages,
  total,
  onPageChange,
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
      </div>

      <nav className="flex flex-wrap items-center gap-1" aria-label="페이지 이동">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="이전 페이지"
        >
          <ChevronLeftIcon />
          <span className="sr-only">이전</span>
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
          aria-label="다음 페이지"
        >
          <ChevronRightIcon />
          <span className="sr-only">다음</span>
        </Button>
      </nav>
    </div>
  );
}
