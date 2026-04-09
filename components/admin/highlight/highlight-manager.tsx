"use client";

import { useMemo, useState } from "react";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";
import type { HomeHighlightInput, HomeHighlightSourceType } from "@/types/home";
import type { HomeHighlightManagerProps } from "@/types/ui";

type EditableHighlight = {
  id: string;
  sourceType: HomeHighlightSourceType;
  sourceId: string;
  orderIndex: number;
  isActive: boolean;
  overrideTitle: string;
  overrideDescription: string;
  overrideImageUrl: string;
  overrideCtaLabel: string;
};

function sourceKey(sourceType: HomeHighlightSourceType, sourceId: string): string {
  return `${sourceType}:${sourceId}`;
}

function toEditableList(
  items: HomeHighlightManagerProps["initialHighlights"],
): EditableHighlight[] {
  return items.map((item, index) => ({
    id: item.id,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    orderIndex: Number.isFinite(item.orderIndex) ? item.orderIndex : index,
    isActive: item.isActive,
    overrideTitle: item.overrideTitle ?? "",
    overrideDescription: item.overrideDescription ?? "",
    overrideImageUrl: item.overrideImageUrl ?? "",
    overrideCtaLabel: item.overrideCtaLabel ?? "",
  }));
}

function normalizePayload(items: EditableHighlight[]): HomeHighlightInput[] {
  return items.map((item, index) => ({
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    orderIndex: index,
    isActive: item.isActive,
    overrideTitle: item.overrideTitle.trim() || null,
    overrideDescription: item.overrideDescription.trim() || null,
    overrideImageUrl: item.overrideImageUrl.trim() || null,
    overrideCtaLabel: item.overrideCtaLabel.trim() || null,
  }));
}

function serialize(items: EditableHighlight[]): string {
  return JSON.stringify(normalizePayload(items));
}

export function HomeHighlightManager({
  initialHighlights,
  initialSources,
}: HomeHighlightManagerProps) {
  const [items, setItems] = useState<EditableHighlight[]>(() => toEditableList(initialHighlights));
  const [savedItems, setSavedItems] = useState<EditableHighlight[]>(() =>
    toEditableList(initialHighlights),
  );
  const [selectedSource, setSelectedSource] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const sourceMap = useMemo(
    () =>
      new Map(
        initialSources.map((source) => [sourceKey(source.sourceType, source.id), source] as const),
      ),
    [initialSources],
  );

  const isDirty = serialize(items) !== serialize(savedItems);

  // 하이라이트 목록에 새 소스를 추가할 때는 기존 중복 항목을 막아 관리 난이도를 낮춘다.
  const addSource = () => {
    if (!selectedSource) {
      return;
    }

    const source = sourceMap.get(selectedSource);

    if (!source) {
      return;
    }

    const alreadyExists = items.some(
      (item) => item.sourceType === source.sourceType && item.sourceId === source.id,
    );

    if (alreadyExists) {
      setNotice({ kind: "error", text: "이미 추가된 항목입니다." });
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: `new-${source.sourceType}-${source.id}`,
        sourceType: source.sourceType,
        sourceId: source.id,
        orderIndex: prev.length,
        isActive: true,
        overrideTitle: "",
        overrideDescription: "",
        overrideImageUrl: "",
        overrideCtaLabel: "",
      },
    ]);
    setNotice(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((item, orderIndex) => ({ ...item, orderIndex }));
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) =>
      prev
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, orderIndex) => ({ ...item, orderIndex })),
    );
  };

  // 저장 시 전체 배열을 교체해 순서/활성/오버라이드 상태를 단일 요청으로 동기화한다.
  const save = async () => {
    setIsPending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/highlights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: normalizePayload(items) }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "하이라이트 저장에 실패했습니다.");
      }

      const payload = (await response.json()) as {
        highlights?: HomeHighlightManagerProps["initialHighlights"];
      };
      const next = toEditableList(payload.highlights ?? []);

      setItems(next);
      setSavedItems(next);
      setNotice({ kind: "success", text: "홈 하이라이트를 저장했습니다." });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ManagerShell
      motion
      summary="메인 Hero 슬라이드 노출 항목을 관리합니다."
      detail="블로그/프로젝트를 선택하고 순서, 활성 상태, 오버라이드 문구를 조정할 수 있습니다."
    >
      <SurfaceCard tone="surface" radius="2xl" padding="md" className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            아직 추가된 하이라이트가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => {
              const source = sourceMap.get(sourceKey(item.sourceType, item.sourceId));

              return (
                <li key={item.id}>
                  <SurfaceCard
                    tone="background"
                    radius="xl"
                    padding="sm"
                    className="space-y-3 sm:p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {source?.title ?? "연결된 원본이 없습니다."}
                        </p>
                        <p className="text-xs text-muted">
                          {item.sourceType === "project" ? "프로젝트" : "블로그"} · 순서 {index + 1}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="위로 이동"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs text-foreground transition-colors hover:bg-foreground/10 disabled:opacity-50"
                          onClick={() => moveItem(index, -1)}
                          disabled={index === 0}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          aria-label="아래로 이동"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs text-foreground transition-colors hover:bg-foreground/10 disabled:opacity-50"
                          onClick={() => moveItem(index, 1)}
                          disabled={index === items.length - 1}
                        >
                          ▼
                        </button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(event) =>
                          setItems((prev) =>
                            prev.map((target, targetIndex) =>
                              targetIndex === index
                                ? {
                                    ...target,
                                    isActive: event.target.checked,
                                  }
                                : target,
                            ),
                          )
                        }
                        className="h-4 w-4 accent-foreground"
                      />
                      활성화
                    </label>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={item.overrideTitle}
                        onChange={(event) =>
                          setItems((prev) =>
                            prev.map((target, targetIndex) =>
                              targetIndex === index
                                ? { ...target, overrideTitle: event.target.value }
                                : target,
                            ),
                          )
                        }
                        placeholder="홈 전용 제목 오버라이드 (선택)"
                      />
                      <Input
                        value={item.overrideCtaLabel}
                        onChange={(event) =>
                          setItems((prev) =>
                            prev.map((target, targetIndex) =>
                              targetIndex === index
                                ? { ...target, overrideCtaLabel: event.target.value }
                                : target,
                            ),
                          )
                        }
                        placeholder="CTA 라벨 오버라이드 (선택)"
                      />
                    </div>

                    <textarea
                      value={item.overrideDescription}
                      onChange={(event) =>
                        setItems((prev) =>
                          prev.map((target, targetIndex) =>
                            targetIndex === index
                              ? { ...target, overrideDescription: event.target.value }
                              : target,
                          ),
                        )
                      }
                      className="min-h-[90px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
                      placeholder="홈 전용 설명 오버라이드 (선택)"
                    />

                    <Input
                      value={item.overrideImageUrl}
                      onChange={(event) =>
                        setItems((prev) =>
                          prev.map((target, targetIndex) =>
                            targetIndex === index
                              ? { ...target, overrideImageUrl: event.target.value }
                              : target,
                          ),
                        )
                      }
                      placeholder="배경 이미지 URL 오버라이드 (선택)"
                    />

                    {item.overrideImageUrl.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.overrideImageUrl}
                        alt="오버라이드 배경 미리보기"
                        className={cn(
                          "h-24 w-full rounded-md border border-border object-cover",
                          !item.overrideImageUrl.trim() && "hidden",
                        )}
                      />
                    ) : null}
                  </SurfaceCard>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span
            className={
              isDirty
                ? "rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                : "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
            }
          >
            {isDirty ? "변경 사항 있음" : "저장된 상태"}
          </span>
          <Button type="button" onClick={save} disabled={isPending || !isDirty}>
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </SurfaceCard>

      {notice ? (
        <p
          className={
            notice.kind === "success"
              ? "text-sm text-emerald-700 dark:text-emerald-300"
              : "text-sm text-red-600"
          }
        >
          {notice.text}
        </p>
      ) : null}
    </ManagerShell>
  );
}
