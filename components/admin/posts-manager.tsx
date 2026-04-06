"use client";

import { useMemo, useState } from "react";
import { EditorDrawer } from "@/components/admin/editor-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renderMarkdownToHtml } from "@/lib/blog/markdown";
import { cn } from "@/lib/utils/cn";
import type { AdminPost, PublishStatus } from "@/types/content";

type PostsManagerProps = {
  initialPosts: AdminPost[];
};

type PostFormState = {
  slug: string;
  title: string;
  description: string;
  status: PublishStatus;
  publishedAt: string;
  readingTime: string;
  tagsText: string;
  bodyMarkdown: string;
};

const EMPTY_FORM: PostFormState = {
  slug: "",
  title: "",
  description: "",
  status: "published",
  publishedAt: "",
  readingTime: "",
  tagsText: "",
  bodyMarkdown: "",
};

function toDateInputValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function toFormState(post: AdminPost): PostFormState {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    status: post.status,
    publishedAt: toDateInputValue(post.publishedAt),
    readingTime: post.readingTime,
    tagsText: post.tags.join(", "),
    bodyMarkdown: post.bodyMarkdown,
  };
}

function parseTags(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

function toDisplayDate(value: string | null): string {
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
    : "bg-amber-500/15 text-amber-700 dark:text-amber-300";
}

export function PostsManager({ initialPosts }: PostsManagerProps) {
  const [posts, setPosts] = useState<AdminPost[]>(initialPosts);
  const [form, setForm] = useState<PostFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const previewHtml = useMemo(() => renderMarkdownToHtml(form.bodyMarkdown), [form.bodyMarkdown]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setDrawerOpen(true);
  };

  const openEdit = (post: AdminPost) => {
    setEditingId(post.id);
    setForm(toFormState(post));
    setMessage(null);
    setDrawerOpen(true);
  };

  const loadPosts = async () => {
    const response = await fetch("/api/admin/posts", { method: "GET" });

    if (!response.ok) {
      throw new Error("게시글 목록을 불러오지 못했습니다.");
    }

    const payload = (await response.json()) as { posts: AdminPost[] };
    setPosts(payload.posts ?? []);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const body = {
        slug: form.slug,
        title: form.title,
        description: form.description,
        status: form.status,
        publishedAt: form.publishedAt || null,
        readingTime: form.readingTime,
        tags: parseTags(form.tagsText),
        bodyMarkdown: form.bodyMarkdown,
      };

      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `/api/admin/posts/${editingId}` : "/api/admin/posts";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "저장에 실패했습니다.");
      }

      await loadPosts();
      setMessage(editingId ? "게시글을 수정했습니다." : "게시글을 생성했습니다.");
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
    if (!window.confirm("이 게시글을 삭제할까요?")) {
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "삭제에 실패했습니다.");
      }

      await loadPosts();
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
      setMessage("게시글을 삭제했습니다.");
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
            <p className="text-sm text-muted">전체 게시글 {posts.length}개</p>
            <p className="text-xs text-muted">행을 클릭하면 오른쪽에서 편집 패널이 열립니다.</p>
          </div>
          <Button type="button" onClick={openCreate}>
            새 게시글
          </Button>
        </header>

        <ul className="overflow-hidden rounded-xl border border-border bg-surface">
          {posts.length > 0 ? (
            posts.map((post) => (
              <li key={post.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => openEdit(post)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5"
                >
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge(post.status))}>
                    {post.status}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {post.title}
                  </span>
                  <span className="hidden text-xs text-muted sm:inline">{post.slug}</span>
                  <span className="text-xs text-muted">{toDisplayDate(post.publishedAt)}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-sm text-muted">아직 게시글이 없습니다.</li>
          )}
        </ul>

        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </section>

      <EditorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "게시글 편집" : "새 게시글"}
        description="저장 즉시 Supabase 데이터가 갱신됩니다."
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
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="설명"
            required
          />

          <div className="grid gap-3 sm:grid-cols-3">
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
            <Input
              type="date"
              value={form.publishedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
            />
            <Input
              value={form.readingTime}
              onChange={(event) => setForm((prev) => ({ ...prev, readingTime: event.target.value }))}
              placeholder="예: 6분"
            />
          </div>

          <Input
            value={form.tagsText}
            onChange={(event) => setForm((prev) => ({ ...prev, tagsText: event.target.value }))}
            placeholder="태그 (쉼표 또는 줄바꿈 구분)"
          />

          <textarea
            value={form.bodyMarkdown}
            onChange={(event) => setForm((prev) => ({ ...prev, bodyMarkdown: event.target.value }))}
            className="min-h-[220px] w-full rounded-md border border-border bg-background p-3 text-sm text-foreground"
            placeholder="Markdown 본문"
            required
          />

          <div className="rounded-xl border border-border bg-background p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">미리보기</p>
            <div className="prose max-h-[280px] overflow-auto" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "저장 중..." : editingId ? "수정 저장" : "게시글 생성"}
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
