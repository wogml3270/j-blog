"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/icons/chevron-left-icon";
import { ChevronRightIcon } from "@/components/ui/icons/chevron-right-icon";
import { cn } from "@/lib/utils/cn";

type ContentPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  previousLabel: string;
  nextLabel: string;
  summaryLabel: string;
};

// 공개 목록은 1 ... N 형태의 숫자 페이지네이션으로 이동한다.
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

export function ContentPagination({
  page,
  totalPages,
  total,
  previousLabel,
  nextLabel,
  summaryLabel,
}: ContentPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const pageItems = buildPageItems(page, totalPages);

  // q 등 기존 쿼리는 유지하고 page만 변경한다.
  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => router.push(next));
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-xs text-muted">
        {summaryLabel} {total} · {page} / {totalPages}
      </p>
      <nav className="flex flex-wrap items-center gap-1" aria-label={summaryLabel}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasPrev || isPending}
          onClick={() => goToPage(page - 1)}
          aria-label={previousLabel}
        >
          <ChevronLeftIcon />
          <span className="sr-only">{previousLabel}</span>
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
              disabled={isPending}
              onClick={() => goToPage(item)}
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
          disabled={!hasNext || isPending}
          onClick={() => goToPage(page + 1)}
          aria-label={nextLabel}
        >
          <ChevronRightIcon />
          <span className="sr-only">{nextLabel}</span>
        </Button>
      </nav>
    </div>
  );
}
