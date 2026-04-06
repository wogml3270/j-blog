"use client";

import { useState } from "react";
import { EditorDrawer } from "@/components/admin/editor-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { AdminProject, ProjectLinks, PublishStatus } from "@/types/content";

type ProjectsManagerProps = {
  initialProjects: AdminProject[];
};

type ProjectFormState = {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  period: string;
  status: PublishStatus;
  featured: boolean;
  techStackText: string;
  achievementsText: string;
  contributionsText: string;
  liveLink: string;
  repoLink: string;
  detailLink: string;
};

const EMPTY_FORM: ProjectFormState = {
  slug: "",
  title: "",
  summary: "",
  thumbnail: "",
  role: "",
  period: "",
  status: "published",
  featured: false,
  techStackText: "",
  achievementsText: "",
  contributionsText: "",
  liveLink: "",
  repoLink: "",
  detailLink: "",
};

function toMultiline(value: string[]): string {
  return value.join("\n");
}

function parseCsv(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function parseLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFormState(project: AdminProject): ProjectFormState {
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    thumbnail: project.thumbnail,
    role: project.role,
    period: project.period,
    status: project.status,
    featured: project.featured,
    techStackText: project.techStack.join(", "),
    achievementsText: toMultiline(project.achievements),
    contributionsText: toMultiline(project.contributions),
    liveLink: project.links.live ?? "",
    repoLink: project.links.repo ?? "",
    detailLink: project.links.detail ?? "",
  };
}

function toLinks(form: ProjectFormState): ProjectLinks {
  return {
    live: form.liveLink.trim() || undefined,
    repo: form.repoLink.trim() || undefined,
    detail: form.detailLink.trim() || undefined,
  };
}

function statusBadge(status: PublishStatus): string {
  return status === "published"
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : "bg-amber-500/15 text-amber-700 dark:text-amber-300";
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setDrawerOpen(true);
  };

  const openEdit = (project: AdminProject) => {
    setEditingId(project.id);
    setForm(toFormState(project));
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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const body = {
        slug: form.slug,
        title: form.title,
        summary: form.summary,
        thumbnail: form.thumbnail,
        role: form.role,
        period: form.period,
        status: form.status,
        featured: form.featured,
        techStack: parseCsv(form.techStackText),
        achievements: parseLines(form.achievementsText),
        contributions: parseLines(form.contributionsText),
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

  return (
    <>
      <section className="mx-auto w-full max-w-4xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
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
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5"
                >
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge(project.status))}>
                    {project.status}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {project.title}
                  </span>
                  <span className="hidden text-xs text-muted sm:inline">{project.slug}</span>
                  {project.featured ? (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                      featured
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
        <form className="space-y-3" onSubmit={onSubmit}>
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
          <Input
            value={form.thumbnail}
            onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
            placeholder="썸네일 URL"
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              placeholder="역할"
              required
            />
            <Input
              value={form.period}
              onChange={(event) => setForm((prev) => ({ ...prev, period: event.target.value }))}
              placeholder="기간"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as PublishStatus }))
              }
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
            <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
              />
              featured
            </label>
          </div>

          <Input
            value={form.techStackText}
            onChange={(event) => setForm((prev) => ({ ...prev, techStackText: event.target.value }))}
            placeholder="기술 스택 (쉼표 구분)"
          />

          <textarea
            value={form.achievementsText}
            onChange={(event) => setForm((prev) => ({ ...prev, achievementsText: event.target.value }))}
            className="min-h-[90px] w-full rounded-md border border-border bg-background p-3 text-sm"
            placeholder="성과 (줄바꿈 구분)"
          />
          <textarea
            value={form.contributionsText}
            onChange={(event) => setForm((prev) => ({ ...prev, contributionsText: event.target.value }))}
            className="min-h-[90px] w-full rounded-md border border-border bg-background p-3 text-sm"
            placeholder="기여 내용 (줄바꿈 구분)"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              value={form.liveLink}
              onChange={(event) => setForm((prev) => ({ ...prev, liveLink: event.target.value }))}
              placeholder="Live 링크"
            />
            <Input
              value={form.repoLink}
              onChange={(event) => setForm((prev) => ({ ...prev, repoLink: event.target.value }))}
              placeholder="Repo 링크"
            />
            <Input
              value={form.detailLink}
              onChange={(event) => setForm((prev) => ({ ...prev, detailLink: event.target.value }))}
              placeholder="Detail 링크"
            />
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
