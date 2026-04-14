"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";
import {
  AdminToolbar,
  AdminToolbarSelect,
} from "@/components/admin/common/admin-toolbar";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/components/ui/icons/filter-icon";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";
import { useBeforeUnloadUnsavedChanges } from "@/lib/utils/unsaved-changes";
import { useAdminUnsavedStore } from "@/stores/admin-unsaved";
import type {
  HomeActiveFilter,
  HomeSlideInput,
  HomeSlideSourceType,
  HomeSourceFilter,
} from "@/types/home-slide";
import type { HomeManagerProps } from "@/types/ui";

type EditableHighlight = {
  id: string;
  sourceType: HomeSlideSourceType;
  sourceId: string;
  orderIndex: number;
  isActive: boolean;
  overrideCtaLabel: string;
};

function sourceKey(sourceType: HomeSlideSourceType, sourceId: string): string {
  return `${sourceType}:${sourceId}`;
}

function toEditableList(items: HomeManagerProps["initialHighlights"]): EditableHighlight[] {
  return items.map((item, index) => ({
    id: item.id,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    orderIndex: Number.isFinite(item.orderIndex) ? item.orderIndex : index,
    isActive: item.isActive,
    overrideCtaLabel: item.overrideCtaLabel ?? "",
  }));
}

function normalizePayload(items: EditableHighlight[]): HomeSlideInput[] {
  return items.map((item, index) => ({
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    orderIndex: index,
    isActive: item.isActive,
    overrideCtaLabel: item.overrideCtaLabel.trim() || null,
  }));
}

function serialize(items: EditableHighlight[]): string {
  return JSON.stringify(normalizePayload(items));
}

function reorderById<T extends { id: string }>(items: T[], event: DragEndEvent): T[] {
  const { active, over } = event;

  if (!over || active.id === over.id) {
    return items;
  }

  const oldIndex = items.findIndex((item) => item.id === active.id);
  const newIndex = items.findIndex((item) => item.id === over.id);

  if (oldIndex < 0 || newIndex < 0) {
    return items;
  }

  return arrayMove(items, oldIndex, newIndex);
}

function reorderByVisibleSubset<T extends { id: string }>(
  items: T[],
  visibleIds: string[],
  event: DragEndEvent,
): T[] {
  if (visibleIds.length <= 1) {
    return items;
  }

  const visibleSet = new Set(visibleIds);
  const visibleItems = items.filter((item) => visibleSet.has(item.id));
  const reorderedVisible = reorderById(visibleItems, event);

  if (reorderedVisible === visibleItems) {
    return items;
  }

  let pointer = 0;
  return items.map((item) => {
    if (!visibleSet.has(item.id)) {
      return item;
    }

    const next = reorderedVisible[pointer];
    pointer += 1;
    return next;
  });
}

function SortableHighlightRow({ children, id }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging ? "shadow-lg" : "")}
    >
      <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-border text-xs text-muted active:cursor-grabbing"
            aria-label="순서 이동"
            title="순서 이동"
            {...attributes}
            {...listeners}
          >
            ≡
          </button>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </SurfaceCard>
    </li>
  );
}

export function HomeManager({
  initialHighlights,
  initialSources,
}: HomeManagerProps) {
  const [items, setItems] = useState<EditableHighlight[]>(() => toEditableList(initialHighlights));
  const [savedItems, setSavedItems] = useState<EditableHighlight[]>(() =>
    toEditableList(initialHighlights),
  );
  const [isPending, setIsPending] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<HomeSourceFilter>("all");
  const [activeFilter, setActiveFilter] = useState<HomeActiveFilter>("all");
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const setUnsavedDirty = useAdminUnsavedStore((state) => state.setDirty);

  const sourceMap = new Map(
    initialSources.map((source) => [sourceKey(source.sourceType, source.id), source] as const),
  );
  const isDirty = serialize(items) !== serialize(savedItems);
  useBeforeUnloadUnsavedChanges(isDirty);

  useEffect(() => {
    setUnsavedDirty("home", isDirty);
    return () => {
      setUnsavedDirty("home", false);
    };
  }, [isDirty, setUnsavedDirty]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const sourceMatched = sourceFilter === "all" || item.sourceType === sourceFilter;
        const activeMatched =
          activeFilter === "all" ||
          (activeFilter === "active" && item.isActive) ||
          (activeFilter === "inactive" && !item.isActive);
        return sourceMatched && activeMatched;
      }),
    [activeFilter, items, sourceFilter],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 홈 슬라이드 항목 순서를 드래그 결과 순서로 재배치한다.
  const onSlidesDragEnd = (event: DragEndEvent) => {
    setItems((prev) =>
      reorderByVisibleSubset(
        prev,
        filteredItems.map((item) => item.id),
        event,
      ),
    );
  };

  // 저장 시 순서/활성 상태와 CTA 오버라이드만 갱신한다.
  const save = async () => {
    setIsPending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/home-slide", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: normalizePayload(items) }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "대시보드 홈 저장에 실패했습니다.");
      }

      const payload = (await response.json()) as { slides?: HomeManagerProps["initialHighlights"] };
      const next = toEditableList(payload.slides ?? []);
      setItems(next);
      setSavedItems(next);
      setNotice({ kind: "success", text: "대시보드 홈 구성을 저장했습니다." });
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
      title="메인 홈 슬라이드 관리"
      motion
      summary="대시보드 홈 Hero 슬라이드 노출 순서와 활성 상태를 관리합니다."
      detail="제목/설명/이미지는 원본 콘텐츠를 사용하며, CTA 라벨만 오버라이드할 수 있습니다."
      action={
        <AdminToolbar>
          <AdminToolbarSelect
            icon={<FilterIcon className="h-3.5 w-3.5 text-muted" />}
            label="소스 필터"
            value={sourceFilter}
            options={[
              { value: "all", label: "전체 소스" },
              { value: "project", label: "프로젝트" },
              { value: "post", label: "블로그" },
            ]}
            onChange={(value) => setSourceFilter(value as HomeSourceFilter)}
          />
          <AdminToolbarSelect
            icon={<FilterIcon className="h-3.5 w-3.5 text-muted" />}
            label="노출 필터"
            value={activeFilter}
            options={[
              { value: "all", label: "전체 노출" },
              { value: "active", label: "활성" },
              { value: "inactive", label: "비활성" },
            ]}
            onChange={(value) => setActiveFilter(value as HomeActiveFilter)}
          />
        </AdminToolbar>
      }
    >
      <SurfaceCard tone="surface" radius="2xl" padding="md" className="space-y-3">
        {filteredItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            조건에 맞는 대시보드 홈 항목이 없습니다.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onSlidesDragEnd}
          >
            <SortableContext
              items={filteredItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3">
                {filteredItems.map((item, index) => {
                  const source = sourceMap.get(sourceKey(item.sourceType, item.sourceId));

                  return (
                    <SortableHighlightRow key={item.id} id={item.id}>
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                          {source?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={source.imageUrl}
                              alt={`${source.title} 썸네일`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                              이미지 없음
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {source?.title ?? "연결된 원본이 없습니다."}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {item.sourceType === "project" ? "프로젝트" : "블로그"} · 순서{" "}
                            {index + 1}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                        <label className="inline-flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(event) =>
                              setItems((prev) =>
                                prev.map((target) =>
                                  target.id === item.id
                                    ? { ...target, isActive: event.target.checked }
                                    : target,
                                ),
                              )
                            }
                            className="h-4 w-4 accent-foreground"
                          />
                          활성화
                        </label>

                        <Input
                          value={item.overrideCtaLabel}
                          onChange={(event) =>
                            setItems((prev) =>
                              prev.map((target) =>
                                target.id === item.id
                                  ? { ...target, overrideCtaLabel: event.target.value }
                                  : target,
                              ),
                            )
                          }
                          placeholder="CTA 라벨 오버라이드 (선택)"
                        />
                      </div>
                    </SortableHighlightRow>
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
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
