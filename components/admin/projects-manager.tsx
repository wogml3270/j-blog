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
import { useEffect, useRef, useState } from "react";
import { EditorDrawer } from "@/components/admin/editor-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { AdminProject, ProjectLinkItem, ProjectLinks, PublishStatus } from "@/types/content";

type ProjectsManagerProps = {
  initialProjects: AdminProject[];
  initialSelectedId?: string | null;
};

type ThumbnailInputMode = "url" | "upload";

type SortableTextItem = {
  id: string;
  value: string;
};

type SortableLinkItem = {
  id: string;
  label: string;
  url: string;
};

type ProjectFormState = {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  startDate: string;
  endDate: string;
  status: PublishStatus;
  featured: boolean;
  techStack: string[];
  techStackInput: string;
  achievements: SortableTextItem[];
  achievementInput: string;
  contributions: SortableTextItem[];
  contributionInput: string;
  links: SortableLinkItem[];
  linkLabelInput: string;
  linkUrlInput: string;
};

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
    slug: project.slug,
    title: project.title,
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

type SortableRowProps = {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
};

function SortableRow({ id, children, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

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
        className="rounded border border-border px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
      >
        삭제
      </button>
    </li>
  );
}

export function ProjectsManager({
  initialProjects,
  initialSelectedId = null,
}: ProjectsManagerProps) {
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailInputMode>("url");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setThumbnailMode("url");
    setThumbnailFile(null);
    setMessage(null);
    setDrawerOpen(true);
  };

  const openEdit = (project: AdminProject) => {
    setEditingId(project.id);
    setForm(toFormState(project));
    setThumbnailMode("url");
    setThumbnailFile(null);
    setMessage(null);
    setDrawerOpen(true);
  };

  const loadProjects = async () => {
    const response = await fetch("/api/admin/projects", { method: "GET" });

    if (!response.ok) {
      throw new Error("프로젝트 목록을 불러오지 못했습니다.");
    }

    const payload = (await response.json()) as { projects: AdminProject[] };
    setProjects(payload.projects ?? []);
  };

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
    setIsPending(true);
    setMessage(null);

    try {
      if (!form.thumbnail.trim()) {
        throw new Error("썸네일 URL을 입력하거나 이미지를 업로드해주세요.");
      }

      const body = {
        slug: form.slug,
        title: form.title,
        summary: form.summary,
        thumbnail: form.thumbnail,
        role: form.role,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        status: form.status,
        featured: form.featured,
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

      await loadProjects();
      setMessage(editingId ? "프로젝트를 수정했습니다." : "프로젝트를 생성했습니다.");
      setDrawerOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setThumbnailMode("url");
      setThumbnailFile(null);
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
      const response = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "삭제에 실패했습니다.");
      }

      await loadProjects();
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
      setMessage("프로젝트를 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (hasAppliedInitialSelection.current || !initialSelectedId) {
      return;
    }

    const target = projects.find((item) => item.id === initialSelectedId);

    if (!target) {
      return;
    }

    openEdit(target);
    hasAppliedInitialSelection.current = true;
  }, [initialSelectedId, projects]);

  return (
    <>
      <section className="ui-strong-motion mx-auto w-full space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
          <div>
            <p className="text-sm text-muted">전체 프로젝트 {projects.length}개</p>
            <p className="text-xs text-muted">프로젝트를 클릭하면 오른쪽 패널에서 수정할 수 있습니다.</p>
          </div>
          <Button type="button" onClick={openCreate}>
            새 프로젝트
          </Button>
        </header>

        <ul className="overflow-hidden rounded-xl border border-border bg-surface">
          {projects.length > 0 ? (
            projects.map((project) => (
              <li key={project.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => openEdit(project)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/5"
                >
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge(project.status))}>
                    {toStatusLabel(project.status)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {project.title}
                  </span>
                  <span className="hidden text-xs text-muted sm:inline">{project.slug}</span>
                  {project.featured ? (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                      추천
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-sm text-muted">아직 프로젝트가 없습니다.</li>
          )}
        </ul>

        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </section>

      <EditorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "프로젝트 편집" : "새 프로젝트"}
        description="필수 필드를 채운 뒤 저장하면 공개 페이지와 동기화됩니다."
      >
        <form className="space-y-3.5" onSubmit={onSubmit}>
          <Input
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
            placeholder="slug"
            required
          />
          <Input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="제목"
            required
          />
          <Input
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
            placeholder="요약"
            required
          />

          <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">썸네일 입력 방식</p>
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
                onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
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
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              placeholder="역할"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                placeholder="시작일"
              />
              <Input
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                placeholder="종료일"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <fieldset className="rounded-md border border-border bg-background px-3 py-2">
              <legend className="px-1 text-xs text-muted">공개 상태</legend>
              <div className="mt-1 flex flex-wrap gap-3 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="project-status"
                    checked={form.status === "published"}
                    onChange={() => setForm((prev) => ({ ...prev, status: "published" }))}
                  />
                  공개
                </label>
                <label className="inline-flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="project-status"
                    checked={form.status === "draft"}
                    onChange={() => setForm((prev) => ({ ...prev, status: "draft" }))}
                  />
                  비공개
                </label>
              </div>
            </fieldset>
            <label className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
              />
              추천 프로젝트
            </label>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">기술 스택</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.techStackInput}
                onChange={(event) => setForm((prev) => ({ ...prev, techStackInput: event.target.value }))}
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
                      className="text-muted hover:text-foreground"
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
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">성과</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.achievementInput}
                onChange={(event) => setForm((prev) => ({ ...prev, achievementInput: event.target.value }))}
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
                setForm((prev) => ({ ...prev, achievements: reorderById(prev.achievements, event) }))
              }
            >
              <SortableContext
                items={form.achievements.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {form.achievements.length > 0 ? (
                    form.achievements.map((item) => (
                      <SortableRow key={item.id} id={item.id} onRemove={() => removeAchievement(item.id)}>
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
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">주요 기여</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.contributionInput}
                onChange={(event) => setForm((prev) => ({ ...prev, contributionInput: event.target.value }))}
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
                setForm((prev) => ({ ...prev, contributions: reorderById(prev.contributions, event) }))
              }
            >
              <SortableContext
                items={form.contributions.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {form.contributions.length > 0 ? (
                    form.contributions.map((item) => (
                      <SortableRow key={item.id} id={item.id} onRemove={() => removeContribution(item.id)}>
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
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">관련 링크</p>
            <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
              <Input
                className="min-w-0"
                value={form.linkLabelInput}
                onChange={(event) => setForm((prev) => ({ ...prev, linkLabelInput: event.target.value }))}
                placeholder="라벨 (예: Demo)"
              />
              <Input
                className="min-w-0"
                value={form.linkUrlInput}
                onChange={(event) => setForm((prev) => ({ ...prev, linkUrlInput: event.target.value }))}
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
                setForm((prev) => ({ ...prev, links: reorderById(prev.links, event) }))
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
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "저장 중..." : editingId ? "수정 저장" : "프로젝트 생성"}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={() => onDelete(editingId)} disabled={isPending}>
                삭제
              </Button>
            ) : null}
          </div>

          {message ? <p className="text-sm text-muted">{message}</p> : null}
        </form>
      </EditorDrawer>
    </>
  );
}
