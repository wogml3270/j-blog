"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorDrawer } from "@/components/admin/common/editor-drawer";
import { ManagerList, ManagerListRow } from "@/components/admin/common/manager-list";
import { MarkdownField } from "@/components/admin/common/markdown-field";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { StatusRadioGroup } from "@/components/admin/common/status-radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { renderMarkdownToHtml } from "@/lib/blog/markdown";
import { cn } from "@/lib/utils/cn";
import type { AdminPost, PublishStatus } from "@/types/content";

type BlogManagerProps = {
  initialPosts: AdminPost[];
  initialSelectedId?: string | null;
};

type ThumbnailInputMode = "url" | "upload";

type PostFormState = {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  status: PublishStatus;
  publishedAt: string;
  tagsText: string;
  bodyMarkdown: string;
};

const EMPTY_FORM: PostFormState = {
  slug: "",
  title: "",
  description: "",
  thumbnail: "",
  status: "published",
  publishedAt: "",
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
    thumbnail: post.thumbnail ?? "",
    status: post.status,
    publishedAt: toDateInputValue(post.publishedAt),
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
    : "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

function toStatusLabel(status: PublishStatus): string {
  return status === "published" ? "공개" : "비공개";
}

export function BlogManager({
  initialPosts,
  initialSelectedId = null,
}: BlogManagerProps) {
  const [posts, setPosts] = useState<AdminPost[]>(initialPosts);
  const [form, setForm] = useState<PostFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailInputMode>("url");
  const [useMarkdownEditor, setUseMarkdownEditor] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);

  // 미리보기 HTML은 입력 markdown 변화에만 반응하도록 메모이징한다.
  const previewHtml = useMemo(() => renderMarkdownToHtml(form.bodyMarkdown), [form.bodyMarkdown]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setUseMarkdownEditor(false);
    setThumbnailMode("url");
    setThumbnailFile(null);
    setMessage(null);
    setDrawerOpen(true);
  };

  const openEdit = (post: AdminPost) => {
    setEditingId(post.id);
    setForm(toFormState(post));
    setUseMarkdownEditor(false);
    setThumbnailMode("url");
    setThumbnailFile(null);
    setMessage(null);
    setDrawerOpen(true);
  };

  // 저장/삭제 이후 서버 정렬 기준(updated_at)을 반영하기 위해 목록을 재조회한다.
  const loadPosts = async () => {
    const response = await fetch("/api/admin/posts", { method: "GET" });

    if (!response.ok) {
      throw new Error("게시글 목록을 불러오지 못했습니다.");
    }

    const payload = (await response.json()) as { posts: AdminPost[] };
    setPosts(payload.posts ?? []);
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
      formData.append("scope", "posts");

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.bodyMarkdown.trim()) {
      setMessage("본문을 입력해주세요.");
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      const body = {
        slug: form.slug,
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail.trim() || null,
        status: form.status,
        publishedAt: form.publishedAt || null,
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
      setUseMarkdownEditor(false);
      setThumbnailMode("url");
      setThumbnailFile(null);
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
        setUseMarkdownEditor(false);
      }
      setMessage("게시글을 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    // 대시보드 딥링크(id 쿼리) 진입 시 초기 대상 글을 자동으로 연다.
    if (hasAppliedInitialSelection.current || !initialSelectedId) {
      return;
    }

    const target = posts.find((item) => item.id === initialSelectedId);

    if (!target) {
      return;
    }

    openEdit(target);
    hasAppliedInitialSelection.current = true;
  }, [initialSelectedId, posts]);

  return (
    <>
      <ManagerShell
        summary={`전체 게시글 ${posts.length}개`}
        detail="행을 클릭하면 오른쪽에서 편집 패널이 열립니다."
        action={
          <Button type="button" onClick={openCreate}>
            새 게시글
          </Button>
        }
        message={message}
      >
        <ManagerList hasItems={posts.length > 0} emptyLabel="아직 게시글이 없습니다.">
          {posts.map((post) => (
            <ManagerListRow key={post.id} onClick={() => openEdit(post)}>
              <>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge(post.status))}>
                    {toStatusLabel(post.status)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {post.title}
                  </span>
                  {post.thumbnail ? (
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-foreground">
                      썸네일
                    </span>
                  ) : null}
                  <span className="hidden text-xs text-muted sm:inline">{post.slug}</span>
                  <span className="text-xs text-muted">{toDisplayDate(post.publishedAt)}</span>
              </>
            </ManagerListRow>
          ))}
        </ManagerList>
      </ManagerShell>

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

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">썸네일 (선택)</p>
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
                onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
                placeholder="https://... 또는 비워두기"
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
              현재 썸네일: {form.thumbnail || "설정 안 함"}
            </p>
          </SurfaceCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatusRadioGroup
              legend="공개 상태"
              name="post-status"
              value={form.status}
              options={[
                { value: "published", label: "공개" },
                { value: "draft", label: "비공개" },
              ]}
              onChange={(value) => setForm((prev) => ({ ...prev, status: value as PublishStatus }))}
              className="rounded-md px-3 py-2"
            />
            <Input
              type="date"
              value={form.publishedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
            />
          </div>

          <Input
            value={form.tagsText}
            onChange={(event) => setForm((prev) => ({ ...prev, tagsText: event.target.value }))}
            placeholder="태그 (쉼표 또는 줄바꿈 구분)"
          />

          <MarkdownField
            label="본문"
            value={form.bodyMarkdown}
            onChange={(value) => setForm((prev) => ({ ...prev, bodyMarkdown: value }))}
            useEditor={useMarkdownEditor}
            onToggleEditor={setUseMarkdownEditor}
            placeholder="Markdown 본문"
            minHeight={320}
            required
          />

          {useMarkdownEditor ? (
            <p className="text-xs text-muted">
              에디터 사용 중에는 상단 에디터의 우측 미리보기가 기준입니다.
            </p>
          ) : (
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">미리보기</p>
              <div className="prose max-h-[280px] overflow-auto" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "저장 중..." : editingId ? "저장" : "게시글 생성"}
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
