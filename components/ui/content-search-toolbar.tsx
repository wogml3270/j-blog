"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons/search-icon";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { normalizeContentSearchQuery } from "@/lib/utils/content-search";
import { cn } from "@/lib/utils/cn";

type ContentSearchToolbarProps = {
  placeholder: string;
  submitLabel: string;
  resetLabel: string;
  defaultSortValue?: string;
  sortOptions?: Array<{
    value: string;
    label: string;
  }>;
};

export function ContentSearchToolbar({
  placeholder,
  submitLabel,
  resetLabel,
  defaultSortValue = "date",
  sortOptions,
}: ContentSearchToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQuery = searchParams.get("q") ?? "";
  const requestedSort = searchParams.get("sort") ?? defaultSortValue;
  const currentSort =
    sortOptions && sortOptions.some((option) => option.value === requestedSort)
      ? requestedSort
      : defaultSortValue;
  const [inputValue, setInputValue] = useState<string>(currentQuery);

  // URL 쿼리값이 바뀌면 입력창도 동일하게 동기화한다.
  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  // q 쿼리스트링을 단일 소스로 유지하면서 검색/초기화를 동일 로직으로 처리한다.
  const updateQuery = (raw: string, nextSort = currentSort) => {
    const normalized = normalizeContentSearchQuery(raw);
    const params = new URLSearchParams(searchParams.toString());

    // 검색어가 변경되면 목록 탐색 컨텍스트를 초기화하기 위해 page를 항상 1로 리셋한다.
    params.delete("page");

    if (normalized) {
      params.set("q", normalized);
    } else {
      params.delete("q");
    }

    if (sortOptions) {
      if (!nextSort || nextSort === defaultSortValue) {
        params.delete("sort");
      } else {
        params.set("sort", nextSort);
      }
    }

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => router.push(next));
  };

  return (
    <SurfaceCard tone="surface" dashed padding="md">
      <form
        className={cn(
          "grid gap-3",
          sortOptions ? "sm:grid-cols-[1fr_auto_auto_auto]" : "sm:grid-cols-[1fr_auto_auto]",
        )}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          updateQuery(String(formData.get("q") ?? ""), currentSort);
        }}
      >
        <Input
          name="q"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <Button type="submit" variant="outline" disabled={isPending} className="gap-1.5">
          <SearchIcon className="h-3.5 w-3.5" />
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending || (!currentQuery.trim() && !inputValue.trim())}
          onClick={() => {
            setInputValue("");
            updateQuery("", currentSort);
          }}
        >
          {resetLabel}
        </Button>
        {sortOptions ? (
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <select
              value={currentSort}
              onChange={(event) => updateQuery(inputValue, event.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              aria-label="정렬"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </form>
    </SurfaceCard>
  );
}
