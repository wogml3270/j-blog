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
import {
  AdminToolbar,
  AdminToolbarAction,
  AdminToolbarSelect,
} from "@/components/admin/common/admin-toolbar";
import { EditorDrawer } from "@/components/admin/common/editor-drawer";
import { ManagerList, ManagerListRow } from "@/components/admin/common/manager-list";
import { MarkdownField } from "@/components/admin/common/markdown-field";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { AdminPagination } from "@/components/admin/common/pagination";
import { StatusRadioGroup } from "@/components/admin/common/status-radio-group";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/components/ui/icons/filter-icon";
import { RowsIcon } from "@/components/ui/icons/rows-icon";
import { TrashIcon } from "@/components/ui/icons/trash-icon";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { uploadAdminMediaFile } from "@/lib/admin/upload-client";
import { ADMIN_PAGE_SIZE_OPTIONS } from "@/lib/utils/pagination";
import { cn } from "@/lib/utils/cn";
import { normalizeSlug } from "@/lib/utils/slug";
import { confirmUnsavedChanges, useBeforeUnloadUnsavedChanges } from "@/lib/utils/unsaved-changes";
import { useAdminDetailStore } from "@/stores/admin-detail";
import { useAdminListUiStore } from "@/stores/admin-list-ui";
import { useAdminUnsavedStore } from "@/stores/admin-unsaved";
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
  homeSummary: "",
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

let clientIdSeed = 0;

function createClientId(prefix: string): string {
  clientIdSeed += 1;
  return `${prefix}-${clientIdSeed}`;
}

function createStableId(prefix: string, seed: string, index: number): string {
  const normalized = seed
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `${prefix}-${index}-${normalized || "item"}`;
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

function toSortableTextItems(
  items: string[],
  prefix: "achievement" | "contribution",
): SortableTextItem[] {
  return uniqueStringList(items).map((value, index) => ({
    id: createStableId(prefix, value, index),
    value,
  }));
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
    next.push({ id: createStableId("link", `${label}-${url}`, next.length), label, url });
  }

  return next;
}

function toFormState(project: AdminProject): ProjectFormState {
  return {
    title: project.title,
    slug: project.slug,
    homeSummary: project.homeSummary,
    summary: project.summary,
    thumbnail: project.thumbnail,
    role: project.role,
    startDate: normalizeDateInput(project.startDate),
    endDate: normalizeDateInput(project.endDate),
    status: project.status,
    featured: project.featured,
    techStack: [...project.techStack],
    techStackInput: "",
    achievements: toSortableTextItems(project.achievements, "achievement"),
    achievementInput: "",
    contributions: toSortableTextItems(project.contributions, "contribution"),
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

function serializeProjectForm(form: ProjectFormState, syncSlugWithTitle: boolean): string {
  return JSON.stringify({
    title: form.title.trim(),
    slug: form.slug.trim(),
    homeSummary: form.homeSummary.trim(),
    summary: form.summary,
    thumbnail: form.thumbnail.trim(),
    role: form.role.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    status: form.status,
    featured: form.featured,
    techStack: uniqueStringList(form.techStack),
    achievements: uniqueStringList(form.achievements.map((item) => item.value)),
    contributions: uniqueStringList(form.contributions.map((item) => item.value)),
    links: toLinks(form),
    syncSlugWithTitle,
  });
}

function toDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
  initialMainPage,
  initialPrivatePage,
  initialFilter = "all",
  initialSelectedId = null,
}: ProjectsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mainProjects, setMainProjects] = useState<AdminProject[]>(initialMainPage.items);
  const [mainPage, setMainPage] = useState(initialMainPage.page);
  const [mainTotal, setMainTotal] = useState(initialMainPage.total);
  const [mainTotalPages, setMainTotalPages] = useState(initialMainPage.totalPages);
  const [privateProjects, setPrivateProjects] = useState<AdminProject[]>(initialPrivatePage.items);
  const [privatePage, setPrivatePage] = useState(initialPrivatePage.page);
  const [privateTotal, setPrivateTotal] = useState(initialPrivatePage.total);
  const [privateTotalPages, setPrivateTotalPages] = useState(initialPrivatePage.totalPages);
  const [pageSize, setPageSize] = useState(initialMainPage.pageSize);
  const [filter, setFilter] = useState<AdminListFilter>(initialFilter);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailInputMode>("url");
  const [syncSlugWithTitle, setSyncSlugWithTitle] = useState(true);
  const [localThumbnailPreview, setLocalThumbnailPreview] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [savedFormSnapshot, setSavedFormSnapshot] = useState<string>(() =>
    serializeProjectForm(EMPTY_FORM, true),
  );
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);
  const thumbnailUploadRequestRef = useRef(0);
  const openDetail = useAdminDetailStore((state) => state.open);
  const closeDetail = useAdminDetailStore((state) => state.close);
  const setUnsavedDirty = useAdminUnsavedStore((state) => state.setDirty);
  const savedPageSize = useAdminListUiStore((state) => state.pageSizeByScope.projects);
  const setSavedPageSize = useAdminListUiStore((state) => state.setPageSize);
  const isFormDirty =
    drawerOpen && serializeProjectForm(form, syncSlugWithTitle) !== savedFormSnapshot;

  useBeforeUnloadUnsavedChanges(isFormDirty);

  useEffect(() => {
    setUnsavedDirty("projects", isFormDirty);
    return () => {
      setUnsavedDirty("projects", false);
    };
  }, [isFormDirty, setUnsavedDirty]);

  // 저장되지 않은 편집 상태가 있을 때 다른 동작으로 넘어가기 전에 확인을 받는다.
  const confirmProceedIfDirty = useCallback(() => {
    if (!isFormDirty) {
      return true;
    }

    return confirmUnsavedChanges();
  }, [isFormDirty]);

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
    (next: {
      id?: string | null;
      mainPage?: number;
      privatePage?: number;
      pageSize?: number;
      filter?: AdminListFilter;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      params.set("mainPage", String(next.mainPage ?? mainPage));
      params.set("privatePage", String(next.privatePage ?? privatePage));
      params.set("pageSize", String(next.pageSize ?? pageSize));
      const nextFilter = next.filter ?? filter;
      if (nextFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", nextFilter);
      }

      if (next.id) {
        params.set("id", next.id);
      } else {
        params.delete("id");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filter, mainPage, pageSize, pathname, privatePage, router, searchParams],
  );

  const openCreate = () => {
    if (!confirmProceedIfDirty()) {
      return;
    }

    setEditingId(null);
    setForm(EMPTY_FORM);
    setSyncSlugWithTitle(true);
    setSavedFormSnapshot(serializeProjectForm(EMPTY_FORM, true));
    setThumbnailMode("url");
    setLocalThumbnailPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return null;
    });
    setMessage(null);
    setDrawerOpen(true);
    closeDetail("projects");
    syncQuery({ id: null });
  };

  const openEdit = useCallback(
    (project: AdminProject) => {
      if (!confirmProceedIfDirty()) {
        return;
      }

      setEditingId(project.id);
      const nextForm = toFormState(project);
      setForm(nextForm);
      setSyncSlugWithTitle(project.syncSlugWithTitle);
      setSavedFormSnapshot(serializeProjectForm(nextForm, project.syncSlugWithTitle));
      setThumbnailMode("url");
      setLocalThumbnailPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
      setMessage(null);
      setDrawerOpen(true);
      openDetail("projects", project.id);
      syncQuery({ id: project.id });
    },
    [confirmProceedIfDirty, openDetail, syncQuery],
  );

  const closeDrawer = () => {
    if (!confirmProceedIfDirty()) {
      return;
    }

    setDrawerOpen(false);
    closeDetail("projects");
    syncQuery({ id: null });
  };

  // 저장/삭제 직후 목록 상태를 서버 기준으로 동기화한다.
  const loadProjects = useCallback(
    async (
      nextMainPage = mainPage,
      nextPrivatePage = privatePage,
      nextPageSize = pageSize,
      nextFilter = filter,
    ) => {
      const [mainResponse, privateResponse] = await Promise.all([
        fetch(
          `/api/admin/projects?page=${nextMainPage}&pageSize=${nextPageSize}&filter=${nextFilter}&statusScope=published`,
          { method: "GET" },
        ),
        fetch(
          `/api/admin/projects?page=${nextPrivatePage}&pageSize=${nextPageSize}&filter=${nextFilter}&statusScope=draft`,
          { method: "GET" },
        ),
      ]);

      if (!mainResponse.ok || !privateResponse.ok) {
        throw new Error("프로젝트 목록을 불러오지 못했습니다.");
      }

      const [mainPayload, privatePayload] = (await Promise.all([
        mainResponse.json(),
        privateResponse.json(),
      ])) as [PaginatedResult<AdminProject>, PaginatedResult<AdminProject>];

      setMainProjects(mainPayload.items ?? []);
      setMainPage(mainPayload.page);
      setMainTotal(mainPayload.total);
      setMainTotalPages(mainPayload.totalPages);
      setPrivateProjects(privatePayload.items ?? []);
      setPrivatePage(privatePayload.page);
      setPrivateTotal(privatePayload.total);
      setPrivateTotalPages(privatePayload.totalPages);
      setPageSize(mainPayload.pageSize);
      setFilter(nextFilter);
      syncQuery({
        id: null,
        mainPage: mainPayload.page,
        privatePage: privatePayload.page,
        pageSize: mainPayload.pageSize,
        filter: nextFilter,
      });
    },
    [filter, mainPage, pageSize, privatePage, syncQuery],
  );

  // 파일 선택 즉시 로컬 미리보기 + 업로드를 수행한다.
  const uploadThumbnailImmediately = async (file: File) => {
    const requestId = ++thumbnailUploadRequestRef.current;
    setIsUploadingThumbnail(true);
    setMessage(null);

    try {
      const payload = await uploadAdminMediaFile(file, "projects");

      if (requestId !== thumbnailUploadRequestRef.current) {
        return;
      }

      if (!payload.url) {
        throw new Error("업로드된 썸네일 URL을 확인할 수 없습니다.");
      }

      setForm((prev) => ({ ...prev, thumbnail: payload.url ?? "" }));
      setLocalThumbnailPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
      setThumbnailMode("url");
      setMessage("썸네일 업로드가 완료되었습니다.");
    } catch (error) {
      if (requestId !== thumbnailUploadRequestRef.current) {
        return;
      }

      setMessage(error instanceof Error ? error.message : "썸네일 업로드 중 오류가 발생했습니다.");
    } finally {
      if (requestId === thumbnailUploadRequestRef.current) {
        setIsUploadingThumbnail(false);
      }
    }
  };

  const onSelectThumbnailFile = (file: File | null) => {
    if (!file) {
      setLocalThumbnailPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
      return;
    }

    const nextPreview = URL.createObjectURL(file);

    setLocalThumbnailPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return nextPreview;
    });
    void uploadThumbnailImmediately(file);
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
      achievements: [...prev.achievements, { id: createClientId("achievement"), value }],
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
      contributions: [...prev.contributions, { id: createClientId("contribution"), value }],
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
      links: [...prev.links, { id: createClientId("link"), label, url }],
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
      setMessage("프로젝트 내용을 입력해주세요.");
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
        homeSummary: form.homeSummary,
        summary: form.summary,
        syncSlugWithTitle,
        useSummaryEditor: true,
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

      await loadProjects(mainPage, privatePage);
      setMessage(editingId ? "프로젝트를 수정했습니다." : "프로젝트를 생성했습니다.");
      setDrawerOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setSyncSlugWithTitle(true);
      setSavedFormSnapshot(serializeProjectForm(EMPTY_FORM, true));
      setThumbnailMode("url");
      setLocalThumbnailPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
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

      await loadProjects(mainPage, privatePage);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setSavedFormSnapshot(serializeProjectForm(EMPTY_FORM, true));
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

    const target = [...mainProjects, ...privateProjects].find(
      (item) => item.id === initialSelectedId,
    );

    if (!target) {
      syncQuery({ id: null });
      hasAppliedInitialSelection.current = true;
      return;
    }

    openEdit(target);
    hasAppliedInitialSelection.current = true;
  }, [initialSelectedId, mainProjects, openEdit, privateProjects, syncQuery]);

  const onChangeMainPage = async (nextPage: number) => {
    if (nextPage === mainPage || nextPage < 1 || nextPage > mainTotalPages) {
      return;
    }

    if (!confirmProceedIfDirty()) {
      return;
    }

    setDrawerOpen(false);
    setEditingId(null);
    setSavedFormSnapshot(serializeProjectForm(EMPTY_FORM, true));
    closeDetail("projects");
    await loadProjects(nextPage, privatePage, pageSize, filter);
  };

  const onChangePageSize = async (nextPageSize: number) => {
    if (nextPageSize === pageSize) {
      return;
    }

    if (!confirmProceedIfDirty()) {
      return;
    }

    setSavedPageSize("projects", nextPageSize);
    setDrawerOpen(false);
    setEditingId(null);
    setSavedFormSnapshot(serializeProjectForm(EMPTY_FORM, true));
    closeDetail("projects");
    await loadProjects(1, 1, nextPageSize, filter);
  };

  const onChangePrivatePage = async (nextPage: number) => {
    if (nextPage === privatePage || nextPage < 1 || nextPage > privateTotalPages) {
      return;
    }

    if (!confirmProceedIfDirty()) {
      return;
    }

    setDrawerOpen(false);
    setEditingId(null);
    setSavedFormSnapshot(serializeProjectForm(EMPTY_FORM, true));
    closeDetail("projects");
    await loadProjects(mainPage, nextPage, pageSize, filter);
  };

  const onChangeFilter = async (nextFilter: AdminListFilter) => {
    if (nextFilter === filter) {
      return;
    }

    if (!confirmProceedIfDirty()) {
      return;
    }

    setDrawerOpen(false);
    setEditingId(null);
    setSavedFormSnapshot(serializeProjectForm(EMPTY_FORM, true));
    closeDetail("projects");
    await loadProjects(1, 1, pageSize, nextFilter);
  };

  useEffect(() => {
    // URL에 pageSize가 없으면 마지막으로 선택한 표시 개수를 우선 적용한다.
    if (searchParams.get("pageSize")) {
      return;
    }

    if (savedPageSize === pageSize) {
      return;
    }

    void loadProjects(1, 1, savedPageSize, filter);
  }, [filter, loadProjects, pageSize, savedPageSize, searchParams]);

  useEffect(() => {
    return () => {
      if (localThumbnailPreview) {
        URL.revokeObjectURL(localThumbnailPreview);
      }
    };
  }, [localThumbnailPreview]);

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

  const total = mainTotal + privateTotal;

  return (
    <>
      <ManagerShell
        motion
        title="프로젝트 관리"
        summary={`전체 프로젝트 ${total}개`}
        action={
          <AdminToolbar>
            <AdminToolbarSelect
              icon={<FilterIcon className="h-3.5 w-3.5 text-muted" />}
              label="상태 필터"
              value={filter}
              options={PROJECT_FILTER_OPTIONS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              onChange={(value) => void onChangeFilter(value as AdminListFilter)}
            />
            <AdminToolbarSelect
              icon={<RowsIcon className="h-3.5 w-3.5 text-muted" />}
              label="페이지 표시 개수"
              value={String(pageSize)}
              options={ADMIN_PAGE_SIZE_OPTIONS.map((option) => ({
                value: String(option),
                label: `${option}줄씩 보기`,
              }))}
              onChange={(value) => void onChangePageSize(Number(value))}
            />
            <AdminToolbarAction>
              <Button type="button" onClick={openCreate}>
                새 프로젝트
              </Button>
            </AdminToolbarAction>
          </AdminToolbar>
        }
        message={message}
      >
        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">공개</h2>
          <ManagerList
            hasItems={mainProjects.length > 0}
            emptyLabel="공개 상태의 프로젝트가 없습니다."
          >
            {mainProjects.map((project) => (
              <ManagerListRow
                key={project.id}
                onClick={() => openEdit(project)}
                className="transition-all duration-300 hover:-translate-y-0.5"
              >
                <>
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.thumbnail}
                      alt={`${project.title} 썸네일`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {project.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">{project.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((item) => (
                        <span
                          key={`${project.id}-${item}`}
                          className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted"
                        >
                          #{item}
                        </span>
                      ))}
                      {project.techStack.length > 3 ? (
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted">
                          +{project.techStack.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col shrink-0 items-end gap-1.5 text-xs">
                    <div className="flex gap-1 justify-center items-center">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-semibold",
                          statusBadge(project.status),
                        )}
                      >
                        {toStatusLabel(project.status)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-medium",
                          project.featured
                            ? "bg-accent/15 text-accent"
                            : "bg-foreground/10 text-foreground",
                        )}
                      >
                        {project.featured ? "메인 노출" : "일반 공개"}
                      </span>
                    </div>
                    <span className="text-muted">{toDisplayDate(project.updatedAt)}</span>
                  </div>
                </>
              </ManagerListRow>
            ))}
          </ManagerList>
        </section>

        <AdminPagination
          page={mainPage}
          totalPages={mainTotalPages}
          total={mainTotal}
          onPageChange={onChangeMainPage}
        />

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">비공개</h2>
          <ManagerList
            hasItems={privateProjects.length > 0}
            emptyLabel="비공개 프로젝트가 없습니다."
          >
            {privateProjects.map((project) => (
              <ManagerListRow
                key={project.id}
                onClick={() => openEdit(project)}
                className="items-start transition-all duration-300 hover:-translate-y-0.5"
              >
                <>
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.thumbnail}
                      alt={`${project.title} 썸네일`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {project.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">{project.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((item) => (
                        <span
                          key={`${project.id}-${item}`}
                          className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted"
                        >
                          #{item}
                        </span>
                      ))}
                      {project.techStack.length > 3 ? (
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted">
                          +{project.techStack.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-semibold",
                        statusBadge(project.status),
                      )}
                    >
                      {toStatusLabel(project.status)}
                    </span>
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-medium text-foreground">
                      비공개
                    </span>
                    <span className="text-muted">{toDisplayDate(project.updatedAt)}</span>
                  </div>
                </>
              </ManagerListRow>
            ))}
          </ManagerList>
        </section>
        <AdminPagination
          page={privatePage}
          totalPages={privateTotalPages}
          total={privateTotal}
          onPageChange={onChangePrivatePage}
        />
      </ManagerShell>

      <EditorDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingId ? "프로젝트 편집" : "새 프로젝트"}
        description="필수 필드를 채운 뒤 저장하면 공개 페이지와 동기화됩니다."
      >
        <form className="space-y-3.5" onSubmit={onSubmit}>
          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">썸네일 업로드</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={thumbnailMode === "url" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setThumbnailMode("url")}
              >
                외부 링크
              </Button>
              <Button
                type="button"
                variant={thumbnailMode === "upload" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setThumbnailMode("upload")}
              >
                파일 업로드
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
                  onChange={(event) => onSelectThumbnailFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5"
                />
                <p className="text-xs text-muted">
                  파일을 선택하면 즉시 미리보기와 업로드가 진행됩니다.
                </p>
              </div>
            )}

            <p className="truncate text-xs text-muted">
              현재 썸네일:{" "}
              {isUploadingThumbnail ? "업로드 중..." : form.thumbnail || "설정되지 않음"}
            </p>
            {localThumbnailPreview || form.thumbnail ? (
              <div className="overflow-hidden rounded-md border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={localThumbnailPreview || form.thumbnail}
                  alt="썸네일 미리보기"
                  className="h-40 w-full object-cover"
                />
              </div>
            ) : (
              <p className="text-xs text-muted">썸네일 미리보기가 없습니다.</p>
            )}
          </SurfaceCard>
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

          <section className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">부제목</label>
            <Input
              value={form.homeSummary}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  homeSummary: event.target.value,
                }))
              }
              placeholder="프로젝트 부제목"
              required
            />
          </section>

          <MarkdownField
            label="프로젝트 내용"
            value={form.summary}
            onChange={(value) => setForm((prev) => ({ ...prev, summary: value }))}
            placeholder="프로젝트 내용"
            required
            minHeight={320}
          />

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
                  if (event.nativeEvent.isComposing) {
                    return;
                  }

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
                  if (event.nativeEvent.isComposing) {
                    return;
                  }

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
                  if (event.nativeEvent.isComposing) {
                    return;
                  }

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
                  if (event.nativeEvent.isComposing) {
                    return;
                  }

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
