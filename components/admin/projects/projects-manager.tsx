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
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EditorDrawer } from "@/components/admin/common/editor-drawer";
import { ManagerList, ManagerListRow } from "@/components/admin/common/manager-list";
import { MarkdownField } from "@/components/admin/common/markdown-field";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { AdminPagination } from "@/components/admin/common/pagination";
import { StatusRadioGroup } from "@/components/admin/common/status-radio-group";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/components/ui/icons/filter-icon";
import { TrashIcon } from "@/components/ui/icons/trash-icon";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";
import { normalizeSlug } from "@/lib/utils/slug";
import { useAdminDetailStore } from "@/stores/admin-detail";
import { useAdminListUiStore } from "@/stores/admin-list-ui";
import type { AdminListFilter, PaginatedResult } from "@/types/admin";
import type { PublishStatus } from "@/types/db";
import type { AdminProject, ProjectLinkItem, ProjectLinks } from "@/types/projects";
import type {
  ProjectFormState,
  ProjectsManagerProps,
  SortableLinkItem,
  SortableRowProps,
  SortableTextItem,
  ThumbnailInputMode,
} from "@/types/ui";

const EMPTY_FORM: ProjectFormState = {
  slug: "",
  title: "",
  summary: "",
  thumbnail: "",
  role: "",
  startDate: "",
  endDate: "",
  status: "published",
  featured: false,
  techStack: [],
  techStackInput: "",
  achievements: [],
  achievementInput: "",
  contributions: [],
  contributionInput: "",
  links: [],
  linkLabelInput: "",
  linkUrlInput: "",
};

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeDateInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function uniqueStringList(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function toSortableTextItems(items: string[]): SortableTextItem[] {
  return uniqueStringList(items).map((value) => ({ id: createId(), value }));
}

function toSortableLinkItems(items: ProjectLinks): SortableLinkItem[] {
  const seen = new Set<string>();
  const next: SortableLinkItem[] = [];

  for (const item of items) {
    const label = item.label.trim();
    const url = item.url.trim();

    if (!label || !url) {
      continue;
    }

    const key = `${label}::${url}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    next.push({ id: createId(), label, url });
  }

  return next;
}

function toFormState(project: AdminProject): ProjectFormState {
  return {
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    thumbnail: project.thumbnail,
    role: project.role,
    startDate: normalizeDateInput(project.startDate),
    endDate: normalizeDateInput(project.endDate),
    status: project.status,
    featured: project.featured,
    techStack: [...project.techStack],
    techStackInput: "",
    achievements: toSortableTextItems(project.achievements),
    achievementInput: "",
    contributions: toSortableTextItems(project.contributions),
    contributionInput: "",
    links: toSortableLinkItems(project.links),
    linkLabelInput: "",
    linkUrlInput: "",
  };
}

function toLinks(form: ProjectFormState): ProjectLinks {
  const links: ProjectLinkItem[] = form.links.map((item) => ({
    label: item.label.trim(),
    url: item.url.trim(),
  }));

  const unique = new Set<string>();
  const normalized: ProjectLinks = [];

  for (const item of links) {
    if (!item.label || !item.url) {
      continue;
    }

    const key = `${item.label}::${item.url}`;

    if (unique.has(key)) {
      continue;
    }

    unique.add(key);
    normalized.push(item);
  }

  return normalized;
}

function statusBadge(status: PublishStatus): string {
  return status === "published"
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

function toStatusLabel(status: PublishStatus): string {
  return status === "published" ? "공개" : "비공개";
}

const PROJECT_FILTER_OPTIONS: Array<{ value: AdminListFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "main", label: "메인 노출" },
  { value: "general", label: "일반" },
  { value: "published", label: "공개" },
  { value: "draft", label: "비공개" },
];

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

function SortableRow({ id, children, onRemove }: SortableRowProps) {
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
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm transition-shadow",
        isDragging ? "shadow-lg" : "hover:shadow-sm",
      )}
    >
      <button
        type="button"
        className="cursor-grab rounded border border-border px-2 py-1 text-xs text-muted active:cursor-grabbing"
        aria-label="순서 이동"
        {...attributes}
        {...listeners}
      >
        ≡
      </button>
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-red-500/40 bg-red-500/10 text-red-700 transition-colors hover:bg-red-500/20 dark:border-red-400/40 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30"
        aria-label="삭제"
        title="삭제"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

export function ProjectsManager({
  initialPage,
  initialSelectedId = null,
  initialFilter = "all",
}: ProjectsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<AdminProject[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [pageSize, setPageSize] = useState(initialPage.pageSize);
  const [total, setTotal] = useState(initialPage.total);
  const [totalPages, setTotalPages] = useState(initialPage.totalPages);
  const [filter, setFilter] = useState<AdminListFilter>(initialFilter);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailInputMode>("url");
  const [useSummaryEditor, setUseSummaryEditor] = useState(false);
  const [syncSlugWithTitle, setSyncSlugWithTitle] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);
  const openDetail = useAdminDetailStore((state) => state.open);
  const closeDetail = useAdminDetailStore((state) => state.close);
  const savedPageSize = useAdminListUiStore((state) => state.pageSizeByScope.projects);
  const setSavedPageSize = useAdminListUiStore((state) => state.setPageSize);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 상세 선택 상태와 현재 페이지를 URL query와 일치시킨다.
  const syncQuery = useCallback(
    (next: { id?: string | null; page?: number; pageSize?: number; filter?: AdminListFilter }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(next.page ?? page));
      params.set("pageSize", String(next.pageSize ?? pageSize));
      const nextFilter = next.filter ?? filter;

      if (next.id) {
        params.set("id", next.id);
      } else {
        params.delete("id");
      }

      if (nextFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", nextFilter);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filter, page, pageSize, pathname, router, searchParams],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setUseSummaryEditor(false);
    setSyncSlugWithTitle(true);
    setThumbnailMode("url");
    setThumbnailFile(null);
    setMessage(null);
    setDrawerOpen(true);
    closeDetail("projects");
    syncQuery({ id: null });
  };

  const openEdit = useCallback(
    (project: AdminProject) => {
      setEditingId(project.id);
      setForm(toFormState(project));
      setUseSummaryEditor(project.useSummaryEditor);
      setSyncSlugWithTitle(false);
      setThumbnailMode("url");
      setThumbnailFile(null);
      setMessage(null);
      setDrawerOpen(true);
      openDetail("projects", project.id);
      syncQuery({ id: project.id });
    },
    [openDetail, syncQuery],
  );

  const closeDrawer = () => {
    setDrawerOpen(false);
    closeDetail("projects");
    syncQuery({ id: null });
  };

  // 저장/삭제 직후 목록 상태를 서버 기준으로 동기화한다.
  const loadProjects = useCallback(
    async (nextPage = page, nextPageSize = pageSize, nextFilter = filter) => {
      const response = await fetch(
        `/api/admin/projects?page=${nextPage}&pageSize=${nextPageSize}&filter=${nextFilter}`,
        { method: "GET" },
      );

      if (!response.ok) {
        throw new Error("프로젝트 목록을 불러오지 못했습니다.");
      }

      const payload = (await response.json()) as PaginatedResult<AdminProject>;
      setProjects(payload.items ?? []);
      setPage(payload.page);
      setPageSize(payload.pageSize);
      setTotal(payload.total);
      setTotalPages(payload.totalPages);

      if ((payload.items?.length ?? 0) === 0 && payload.total > 0 && nextPage > 1) {
        await loadProjects(nextPage - 1, nextPageSize);
        return;
      }

      syncQuery({
        id: null,
        page: payload.page,
        pageSize: payload.pageSize,
        filter: nextFilter,
      });
    },
    [filter, page, pageSize, syncQuery],
  );

  const onUploadThumbnail = async () => {
    if (!thumbnailFile) {
      setMessage("업로드할 이미지 파일을 선택해주세요.");
      return;
    }

    setIsUploadingThumbnail(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", thumbnailFile);
      formData.append("scope", "projects");

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "썸네일 업로드에 실패했습니다.");
      }

      const payload = (await response.json()) as { url?: string };

      if (!payload.url) {
        throw new Error("업로드된 썸네일 URL을 확인할 수 없습니다.");
      }

      setForm((prev) => ({ ...prev, thumbnail: payload.url ?? "" }));
      setThumbnailFile(null);
      setThumbnailMode("url");
      setMessage("썸네일 업로드가 완료되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "썸네일 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const addTechStackItem = () => {
    const next = form.techStackInput.trim();

    if (!next) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      techStack: uniqueStringList([...prev.techStack, next]),
      techStackInput: "",
    }));
  };

  const removeTechStackItem = (value: string) => {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((item) => item !== value),
    }));
  };

  const addAchievement = () => {
    const value = form.achievementInput.trim();

    if (!value) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { id: createId(), value }],
      achievementInput: "",
    }));
  };

  const removeAchievement = (id: string) => {
    setForm((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((item) => item.id !== id),
    }));
  };

  const addContribution = () => {
    const value = form.contributionInput.trim();

    if (!value) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      contributions: [...prev.contributions, { id: createId(), value }],
      contributionInput: "",
    }));
  };

  const removeContribution = (id: string) => {
    setForm((prev) => ({
      ...prev,
      contributions: prev.contributions.filter((item) => item.id !== id),
    }));
  };

  const addLink = () => {
    const label = form.linkLabelInput.trim();
    const url = form.linkUrlInput.trim();

    if (!label || !url) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { id: createId(), label, url }],
      linkLabelInput: "",
      linkUrlInput: "",
    }));
  };

  const removeLink = (id: string) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((item) => item.id !== id),
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.summary.trim()) {
      setMessage("프로젝트 요약을 입력해주세요.");
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      if (!form.thumbnail.trim()) {
        throw new Error("썸네일 URL을 입력하거나 이미지를 업로드해주세요.");
      }

      const normalizedSlug = normalizeSlug(form.slug);

      if (!normalizedSlug) {
        throw new Error("슬러그를 확인해주세요. (한글/영문/숫자/_)");
      }

      const body = {
        title: form.title,
        slug: normalizedSlug,
        summary: form.summary,
        useSummaryEditor,
        thumbnail: form.thumbnail,
        role: form.role,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        status: form.status,
        featured: form.status === "published" ? form.featured : false,
        techStack: uniqueStringList(form.techStack),
        achievements: uniqueStringList(form.achievements.map((item) => item.value)),
        contributions: uniqueStringList(form.contributions.map((item) => item.value)),
        links: toLinks(form),
      };

      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "저장에 실패했습니다.");
      }

      await loadProjects(page);
      setMessage(editingId ? "프로젝트를 수정했습니다." : "프로젝트를 생성했습니다.");
      setDrawerOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setUseSummaryEditor(false);
      setSyncSlugWithTitle(true);
      setThumbnailMode("url");
      setThumbnailFile(null);
      closeDetail("projects");
      syncQuery({ id: null });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("이 프로젝트를 삭제할까요?")) {
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "삭제에 실패했습니다.");
      }

      await loadProjects(page);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setUseSummaryEditor(false);
        closeDetail("projects");
      }
      syncQuery({ id: null });
      setMessage("프로젝트를 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    // 대시보드 딥링크(id 쿼리)로 들어온 경우 최초 한 번 대상 프로젝트를 연다.
    if (hasAppliedInitialSelection.current || !initialSelectedId) {
      return;
    }

    const target = projects.find((item) => item.id === initialSelectedId);

    if (!target) {
      syncQuery({ id: null });
      hasAppliedInitialSelection.current = true;
      return;
    }

    openEdit(target);
    hasAppliedInitialSelection.current = true;
  }, [initialSelectedId, openEdit, projects, syncQuery]);

  const onChangePage = async (nextPage: number) => {
    if (nextPage === page || nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setDrawerOpen(false);
    setEditingId(null);
    closeDetail("projects");
    await loadProjects(nextPage, pageSize, filter);
  };

  const onChangePageSize = async (nextPageSize: number) => {
    if (nextPageSize === pageSize) {
      return;
    }

    setSavedPageSize("projects", nextPageSize);
    setDrawerOpen(false);
    setEditingId(null);
    closeDetail("projects");
    await loadProjects(1, nextPageSize, filter);
  };

  const onChangeFilter = async (nextFilter: AdminListFilter) => {
    if (nextFilter === filter) {
      return;
    }

    setFilter(nextFilter);
    setDrawerOpen(false);
    setEditingId(null);
    closeDetail("projects");
    await loadProjects(1, pageSize, nextFilter);
  };

  useEffect(() => {
    // URL에 pageSize가 없으면 마지막으로 선택한 표시 개수를 우선 적용한다.
    if (searchParams.get("pageSize")) {
      return;
    }

    if (savedPageSize === pageSize) {
      return;
    }

    void loadProjects(1, savedPageSize, filter);
  }, [filter, loadProjects, pageSize, savedPageSize, searchParams]);

  useEffect(() => {
    // 제목-슬러그 자동 동기화가 켜져 있으면 title 변경을 slug에 즉시 반영한다.
    if (!syncSlugWithTitle) {
      return;
    }

    const nextSlug = normalizeSlug(form.title);

    setForm((prev) => {
      if (prev.slug === nextSlug) {
        return prev;
      }

      return {
        ...prev,
        slug: nextSlug,
      };
    });
  }, [form.title, syncSlugWithTitle]);

  return (
    <>
      <ManagerShell
        motion
        summary={`전체 프로젝트 ${total}개`}
        detail="프로젝트를 클릭하면 오른쪽 패널에서 수정할 수 있습니다."
        action={
          <div className="flex items-center gap-2">
            <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <FilterIcon className="h-3.5 w-3.5 text-muted" />
              <span className="sr-only">필터</span>
              <select
                className="bg-transparent text-sm outline-none"
                value={filter}
                onChange={(event) => void onChangeFilter(event.target.value as AdminListFilter)}
              >
                {PROJECT_FILTER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" onClick={openCreate}>
              새 프로젝트
            </Button>
          </div>
        }
        message={message}
      >
        <ManagerList hasItems={projects.length > 0} emptyLabel="아직 프로젝트가 없습니다.">
          {projects.map((project) => (
            <ManagerListRow
              key={project.id}
              onClick={() => openEdit(project)}
              className="transition-all duration-300 hover:-translate-y-0.5"
            >
              <>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    statusBadge(project.status),
                  )}
                >
                  {toStatusLabel(project.status)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {project.title}
                </span>
                <span className="hidden text-xs text-muted sm:inline">{project.slug}</span>
                {project.status === "published" && project.featured ? (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                    메인 노출
                  </span>
                ) : null}
              </>
            </ManagerListRow>
          ))}
        </ManagerList>
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onChangePage}
          onPageSizeChange={onChangePageSize}
        />
      </ManagerShell>

      <EditorDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingId ? "프로젝트 편집" : "새 프로젝트"}
        description="필수 필드를 채운 뒤 저장하면 공개 페이지와 동기화됩니다."
      >
        <form className="space-y-3.5" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">제목</label>
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="제목"
              required
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">
                슬러그
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={syncSlugWithTitle}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setSyncSlugWithTitle(checked);

                    if (checked) {
                      setForm((prev) => ({
                        ...prev,
                        slug: normalizeSlug(prev.title),
                      }));
                    }
                  }}
                />
                제목과 동일
              </label>
            </div>
            <Input
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: normalizeSlug(event.target.value) }))
              }
              placeholder="slug"
              required
              disabled={syncSlugWithTitle}
            />
          </div>

          <MarkdownField
            label="요약"
            value={form.summary}
            onChange={(value) => setForm((prev) => ({ ...prev, summary: value }))}
            useEditor={useSummaryEditor}
            onToggleEditor={setUseSummaryEditor}
            placeholder="요약"
            required
            minHeight={180}
          />

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              썸네일 입력 방식
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={thumbnailMode === "url" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setThumbnailMode("url")}
              >
                외부 링크 붙여넣기
              </Button>
              <Button
                type="button"
                variant={thumbnailMode === "upload" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setThumbnailMode("upload")}
              >
                PC 파일 업로드
              </Button>
            </div>

            {thumbnailMode === "url" ? (
              <Input
                value={form.thumbnail}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    thumbnail: event.target.value,
                  }))
                }
                placeholder="https://... 또는 /images/..."
                required
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5"
                />
                <Button
                  type="button"
                  onClick={onUploadThumbnail}
                  disabled={isUploadingThumbnail || !thumbnailFile}
                >
                  {isUploadingThumbnail ? "업로드 중..." : "업로드 후 적용"}
                </Button>
              </div>
            )}

            <p className="truncate text-xs text-muted">
              현재 썸네일: {form.thumbnail || "설정되지 않음"}
            </p>
            {form.thumbnail ? (
              <div className="overflow-hidden rounded-md border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.thumbnail}
                  alt="썸네일 미리보기"
                  className="h-40 w-full object-cover"
                />
              </div>
            ) : (
              <p className="text-xs text-muted">썸네일 미리보기가 없습니다.</p>
            )}
          </SurfaceCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">역할</label>
              <Input
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                placeholder="역할"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">기간</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                  placeholder="시작일"
                />
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }))
                  }
                  placeholder="종료일"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 items-center">
            <StatusRadioGroup
              legend="공개 상태"
              name="project-status"
              value={form.status}
              options={[
                { value: "published", label: "공개" },
                { value: "draft", label: "비공개" },
              ]}
              onChange={(value) =>
                setForm((prev) => {
                  const nextStatus = value as PublishStatus;

                  if (nextStatus === "draft") {
                    return { ...prev, status: nextStatus, featured: false };
                  }

                  return { ...prev, status: nextStatus };
                })
              }
              className="rounded-md px-3 py-2"
            />
            {form.status === "published" ? (
              <label className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      featured: event.target.checked,
                    }))
                  }
                />
                메인 페이지 노출
              </label>
            ) : (
              <div className="inline-flex h-12 items-center rounded-md border border-border/60 bg-background/50 px-3 text-xs text-muted">
                비공개 상태에서는 메인 페이지 노출 설정을 할 수 없습니다.
              </div>
            )}
          </div>

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">기술 스택</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.techStackInput}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    techStackInput: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTechStackItem();
                  }
                }}
                placeholder="기술명을 입력하고 Enter"
              />
              <Button type="button" className="h-10 shrink-0 px-4" onClick={addTechStackItem}>
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.techStack.length > 0 ? (
                form.techStack.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs"
                  >
                    {item}
                    <button
                      type="button"
                      className="text-red-600/80 transition-colors hover:text-red-500 dark:text-red-300/85 dark:hover:text-red-200"
                      aria-label={`${item} 삭제`}
                      onClick={() => removeTechStackItem(item)}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-muted">아직 추가된 기술 스택이 없습니다.</p>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">성과</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.achievementInput}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    achievementInput: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addAchievement();
                  }
                }}
                placeholder="성과를 입력하고 Enter"
              />
              <Button type="button" className="h-10 shrink-0 px-4" onClick={addAchievement}>
                추가
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) =>
                setForm((prev) => ({
                  ...prev,
                  achievements: reorderById(prev.achievements, event),
                }))
              }
            >
              <SortableContext
                items={form.achievements.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {form.achievements.length > 0 ? (
                    form.achievements.map((item) => (
                      <SortableRow
                        key={item.id}
                        id={item.id}
                        onRemove={() => removeAchievement(item.id)}
                      >
                        <p className="truncate">{item.value}</p>
                      </SortableRow>
                    ))
                  ) : (
                    <li className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted">
                      등록된 성과가 없습니다.
                    </li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          </SurfaceCard>

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">주요 기여</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.contributionInput}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    contributionInput: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addContribution();
                  }
                }}
                placeholder="기여를 입력하고 Enter"
              />
              <Button type="button" className="h-10 shrink-0 px-4" onClick={addContribution}>
                추가
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) =>
                setForm((prev) => ({
                  ...prev,
                  contributions: reorderById(prev.contributions, event),
                }))
              }
            >
              <SortableContext
                items={form.contributions.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {form.contributions.length > 0 ? (
                    form.contributions.map((item) => (
                      <SortableRow
                        key={item.id}
                        id={item.id}
                        onRemove={() => removeContribution(item.id)}
                      >
                        <p className="truncate">{item.value}</p>
                      </SortableRow>
                    ))
                  ) : (
                    <li className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted">
                      등록된 기여가 없습니다.
                    </li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          </SurfaceCard>

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">관련 링크</p>
            <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
              <Input
                className="min-w-0"
                value={form.linkLabelInput}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    linkLabelInput: event.target.value,
                  }))
                }
                placeholder="라벨 (예: Demo)"
              />
              <Input
                className="min-w-0"
                value={form.linkUrlInput}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    linkUrlInput: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addLink();
                  }
                }}
                placeholder="https://..."
              />
              <Button type="button" className="h-10 shrink-0 px-4" onClick={addLink}>
                추가
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) =>
                setForm((prev) => ({
                  ...prev,
                  links: reorderById(prev.links, event),
                }))
              }
            >
              <SortableContext
                items={form.links.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {form.links.length > 0 ? (
                    form.links.map((item) => (
                      <SortableRow key={item.id} id={item.id} onRemove={() => removeLink(item.id)}>
                        <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                        <p className="truncate text-xs text-muted">{item.url}</p>
                      </SortableRow>
                    ))
                  ) : (
                    <li className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted">
                      등록된 링크가 없습니다.
                    </li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          </SurfaceCard>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "저장 중..." : editingId ? "저장" : "프로젝트 생성"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(editingId)}
                disabled={isPending}
                aria-label="프로젝트 삭제"
              >
                <TrashIcon />
                <span className="sr-only">삭제</span>
              </Button>
            ) : null}
          </div>

          {message ? <p className="text-sm text-muted">{message}</p> : null}
        </form>
      </EditorDrawer>
    </>
  );
}
