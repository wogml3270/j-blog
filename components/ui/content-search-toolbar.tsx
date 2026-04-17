"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { normalizeContentSearchQuery } from "@/lib/utils/content-search";

type ContentSearchToolbarProps = {
  placeholder: string;
  submitLabel: string;
  resetLabel: string;
};

export function ContentSearchToolbar({
  placeholder,
  submitLabel,
  resetLabel,
}: ContentSearchToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQuery = searchParams.get("q") ?? "";

  // q 쿼리스트링을 단일 소스로 유지하면서 검색/초기화를 동일 로직으로 처리한다.
  const updateQuery = (raw: string) => {
    const normalized = normalizeContentSearchQuery(raw);
    const params = new URLSearchParams(searchParams.toString());

    // 검색어가 변경되면 목록 탐색 컨텍스트를 초기화하기 위해 page를 항상 1로 리셋한다.
    params.delete("page");

    if (normalized) {
      params.set("q", normalized);
    } else {
      params.delete("q");
    }

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => router.push(next));
  };

  return (
    <SurfaceCard tone="surface" dashed padding="md">
      <form
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          updateQuery(String(formData.get("q") ?? ""));
        }}
      >
        <Input
          name="q"
          defaultValue={currentQuery}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <Button type="submit" variant="outline" disabled={isPending}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending || !currentQuery.trim()}
          onClick={() => {
            updateQuery("");
          }}
        >
          {resetLabel}
        </Button>
      </form>
    </SurfaceCard>
  );
}
