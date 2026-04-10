"use client";

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
import { RowsIcon } from "@/components/ui/icons/rows-icon";
import { TrashIcon } from "@/components/ui/icons/trash-icon";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { uploadAdminMediaFile } from "@/lib/admin/upload-client";
import { ADMIN_PAGE_SIZE_OPTIONS } from "@/lib/utils/pagination";
import { cn } from "@/lib/utils/cn";
import { normalizeSlug } from "@/lib/utils/slug";
import { useAdminDetailStore } from "@/stores/admin-detail";
import { useAdminListUiStore } from "@/stores/admin-list-ui";
import type { AdminListFilter, PaginatedResult } from "@/types/admin";
import type { AdminPost } from "@/types/blog";
import type { PublishStatus } from "@/types/db";
import type { BlogManagerProps, PostFormState, ThumbnailInputMode } from "@/types/ui";

const EMPTY_FORM: PostFormState = {
  title: "",
  slug: "",
  description: "",
  thumbnail: "",
  status: "published",
  featured: false,
  publishedAt: "",
  scheduledPublishAt: "",
  tags: [],
  tagInput: "",
  bodyMarkdown: "",
};

// UTC 시각을 datetime-local 입력 포맷으로 안전하게 변환한다.
function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

// 편집 폼 초기값은 API 응답 객체를 기준으로 구성한다.
function toFormState(post: AdminPost): PostFormState {
  return {
    title: post.title,
    slug: post.slug,
    description: post.description,
    thumbnail: post.thumbnail ?? "",
    status: post.status,
    featured: post.featured,
    publishedAt: post.publishedAt ?? "",
    scheduledPublishAt: toDateTimeLocalValue(post.scheduledPublishAt),
    tags: [...post.tags],
    tagInput: "",
    bodyMarkdown: post.bodyMarkdown,
  };
}

// 태그 목록은 trim 처리 후 중복 없이 저장한다.
function normalizeTagList(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
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

function toDisplayDateTime(value: string | null): string {
  if (!value) {
    return "자동 설정";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "자동 설정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toUtcIsoFromDateTimeLocal(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function statusBadge(status: PublishStatus): string {
  return status === "published"
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

function toStatusLabel(status: PublishStatus): string {
  return status === "published" ? "공개" : "비공개";
}

const BLOG_FILTER_OPTIONS: Array<{ value: AdminListFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "main", label: "메인 노출" },
  { value: "general", label: "일반" },
  { value: "published", label: "공개" },
  { value: "draft", label: "비공개" },
];

export function BlogManager({
  initialMainPage,
  initialPrivatePage,
  initialFilter = "all",
  initialSelectedId = null,
}: BlogManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mainPosts, setMainPosts] = useState<AdminPost[]>(initialMainPage.items);
  const [mainPage, setMainPage] = useState(initialMainPage.page);
  const [mainTotal, setMainTotal] = useState(initialMainPage.total);
  const [mainTotalPages, setMainTotalPages] = useState(initialMainPage.totalPages);
  const [privatePosts, setPrivatePosts] = useState<AdminPost[]>(initialPrivatePage.items);
  const [privatePage, setPrivatePage] = useState(initialPrivatePage.page);
  const [privateTotal, setPrivateTotal] = useState(initialPrivatePage.total);
  const [privateTotalPages, setPrivateTotalPages] = useState(initialPrivatePage.totalPages);
  const [pageSize, setPageSize] = useState(initialMainPage.pageSize);
  const [filter, setFilter] = useState<AdminListFilter>(initialFilter);
  const [form, setForm] = useState<PostFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailInputMode>("url");
  const [syncSlugWithTitle, setSyncSlugWithTitle] = useState(true);
  const [localThumbnailPreview, setLocalThumbnailPreview] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);
  const thumbnailUploadRequestRef = useRef(0);

  const openDetail = useAdminDetailStore((state) => state.open);
  const closeDetail = useAdminDetailStore((state) => state.close);
  const savedPageSize = useAdminListUiStore((state) => state.pageSizeByScope.blog);
  const setSavedPageSize = useAdminListUiStore((state) => state.setPageSize);

  // 상세 패널 상태와 페이지 상태를 URL 쿼리와 일치시킨다.
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
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSyncSlugWithTitle(true);
    setThumbnailMode("url");
    setLocalThumbnailPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return null;
    });
    setMessage(null);
    setDrawerOpen(true);
    closeDetail("blog");
    syncQuery({ id: null });
  };

  const openEdit = useCallback(
    (post: AdminPost) => {
      setEditingId(post.id);
      setForm(toFormState(post));
      setSyncSlugWithTitle(post.syncSlugWithTitle);
      setThumbnailMode("url");
      setLocalThumbnailPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
      setMessage(null);
      setDrawerOpen(true);
      openDetail("blog", post.id);
      syncQuery({ id: post.id });
    },
    [openDetail, syncQuery],
  );

  const closeDrawer = () => {
    setDrawerOpen(false);
    closeDetail("blog");
    syncQuery({ id: null });
  };

  // 목록 재조회 시 page 메타를 함께 갱신해 페이징 상태를 보정한다.
  const loadPosts = useCallback(
    async (
      nextMainPage = mainPage,
      nextPrivatePage = privatePage,
      nextPageSize = pageSize,
      nextFilter = filter,
    ) => {
      const [mainResponse, privateResponse] = await Promise.all([
        fetch(
          `/api/admin/posts?page=${nextMainPage}&pageSize=${nextPageSize}&filter=${nextFilter}&statusScope=published`,
          { method: "GET" },
        ),
        fetch(
          `/api/admin/posts?page=${nextPrivatePage}&pageSize=${nextPageSize}&filter=${nextFilter}&statusScope=draft`,
          { method: "GET" },
        ),
      ]);

      if (!mainResponse.ok || !privateResponse.ok) {
        throw new Error("게시글 목록을 불러오지 못했습니다.");
      }

      const [mainPayload, privatePayload] = (await Promise.all([
        mainResponse.json(),
        privateResponse.json(),
      ])) as [PaginatedResult<AdminPost>, PaginatedResult<AdminPost>];

      setMainPosts(mainPayload.items ?? []);
      setMainPage(mainPayload.page);
      setMainTotal(mainPayload.total);
      setMainTotalPages(mainPayload.totalPages);
      setPrivatePosts(privatePayload.items ?? []);
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

  // 태그 입력은 기술스택과 같은 칩 UX로 통일한다.
  const addTag = () => {
    const nextTag = form.tagInput.trim();

    if (!nextTag) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: normalizeTagList([...prev.tags, nextTag]),
      tagInput: "",
    }));
  };

  const removeTag = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== value),
    }));
  };

  // 파일 선택 즉시 로컬 미리보기 + 업로드를 수행한다.
  const uploadThumbnailImmediately = async (file: File) => {
    const requestId = ++thumbnailUploadRequestRef.current;
    setIsUploadingThumbnail(true);
    setMessage(null);

    try {
      const payload = await uploadAdminMediaFile(file, "blog");

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.bodyMarkdown.trim()) {
      setMessage("본문을 입력해주세요.");
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      const normalizedSlug = normalizeSlug(form.slug);

      if (!normalizedSlug) {
        throw new Error("슬러그를 확인해주세요. (한글/영문/숫자/_)");
      }

      const body = {
        slug: normalizedSlug,
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail.trim() || null,
        featured: form.status === "published" ? form.featured : false,
        syncSlugWithTitle,
        status: form.status,
        publishedAt: form.publishedAt || null,
        scheduledPublishAt:
          form.status === "published" ? toUtcIsoFromDateTimeLocal(form.scheduledPublishAt) : null,
        tags: normalizeTagList(form.tags),
        bodyMarkdown: form.bodyMarkdown,
        useMarkdownEditor: true,
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

      await loadPosts(mainPage, privatePage);
      setMessage(editingId ? "게시글을 수정했습니다." : "게시글을 생성했습니다.");
      setDrawerOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setSyncSlugWithTitle(true);
      setThumbnailMode("url");
      setLocalThumbnailPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
      closeDetail("blog");
      syncQuery({ id: null });
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
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "삭제에 실패했습니다.");
      }

      await loadPosts(mainPage, privatePage);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        closeDetail("blog");
      }
      syncQuery({ id: null });
      setMessage("게시글을 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const onChangeMainPage = async (nextPage: number) => {
    if (nextPage === mainPage || nextPage < 1 || nextPage > mainTotalPages) {
      return;
    }

    setDrawerOpen(false);
    setEditingId(null);
    closeDetail("blog");
    await loadPosts(nextPage, privatePage, pageSize, filter);
  };

  const onChangePageSize = async (nextPageSize: number) => {
    if (nextPageSize === pageSize) {
      return;
    }

    setSavedPageSize("blog", nextPageSize);
    setDrawerOpen(false);
    setEditingId(null);
    closeDetail("blog");
    await loadPosts(1, 1, nextPageSize, filter);
  };

  const onChangePrivatePage = async (nextPage: number) => {
    if (nextPage === privatePage || nextPage < 1 || nextPage > privateTotalPages) {
      return;
    }

    setDrawerOpen(false);
    setEditingId(null);
    closeDetail("blog");
    await loadPosts(mainPage, nextPage, pageSize, filter);
  };

  const onChangeFilter = async (nextFilter: AdminListFilter) => {
    if (nextFilter === filter) {
      return;
    }

    setDrawerOpen(false);
    setEditingId(null);
    closeDetail("blog");
    await loadPosts(1, 1, pageSize, nextFilter);
  };

  useEffect(() => {
    // URL에 pageSize가 없으면 마지막으로 선택한 표시 개수를 우선 적용한다.
    if (searchParams.get("pageSize")) {
      return;
    }

    if (savedPageSize === pageSize) {
      return;
    }

    void loadPosts(1, 1, savedPageSize, filter);
  }, [filter, loadPosts, pageSize, savedPageSize, searchParams]);

  useEffect(() => {
    return () => {
      if (localThumbnailPreview) {
        URL.revokeObjectURL(localThumbnailPreview);
      }
    };
  }, [localThumbnailPreview]);

  useEffect(() => {
    // 대시보드 딥링크(id 쿼리) 진입 시 초기 대상 글을 자동으로 연다.
    if (hasAppliedInitialSelection.current || !initialSelectedId) {
      return;
    }

    const target = [...mainPosts, ...privatePosts].find((item) => item.id === initialSelectedId);

    if (!target) {
      syncQuery({ id: null });
      hasAppliedInitialSelection.current = true;
      return;
    }

    openEdit(target);
    hasAppliedInitialSelection.current = true;
  }, [initialSelectedId, mainPosts, openEdit, privatePosts, syncQuery]);

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
        summary={`전체 게시글 ${total}개`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <FilterIcon className="h-3.5 w-3.5 text-muted" />
              <span className="sr-only">상태 필터</span>
              <select
                className="bg-transparent text-sm outline-none"
                value={filter}
                aria-label="상태 필터"
                onChange={(event) => void onChangeFilter(event.target.value as AdminListFilter)}
              >
                {BLOG_FILTER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <RowsIcon className="h-3.5 w-3.5 text-muted" />
              <span className="sr-only">표시 개수</span>
              <select
                className="bg-transparent text-sm outline-none"
                value={String(pageSize)}
                aria-label="페이지 표시 개수"
                onChange={(event) => void onChangePageSize(Number(event.target.value))}
              >
                {ADMIN_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}줄씩 보기
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" onClick={openCreate}>
              새 게시글
            </Button>
          </div>
        }
        message={message}
      >
        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">공개</h2>
          <ManagerList hasItems={mainPosts.length > 0} emptyLabel="공개 상태의 게시글이 없습니다.">
            {mainPosts.map((post) => (
              <ManagerListRow key={post.id} onClick={() => openEdit(post)}>
                <>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      statusBadge(post.status),
                    )}
                  >
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
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      post.featured
                        ? "bg-accent/15 text-accent"
                        : "bg-foreground/10 text-foreground",
                    )}
                  >
                    {post.featured ? "메인 노출" : "일반 공개"}
                  </span>
                  <span className="hidden text-xs text-muted sm:inline">{post.slug}</span>
                  <span className="text-xs text-muted">{toDisplayDate(post.publishedAt)}</span>
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
          <ManagerList hasItems={privatePosts.length > 0} emptyLabel="비공개 게시글이 없습니다.">
            {privatePosts.map((post) => (
              <ManagerListRow key={post.id} onClick={() => openEdit(post)}>
                <>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      statusBadge(post.status),
                    )}
                  >
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
                  <span className="text-xs text-muted">비공개</span>
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
        title={editingId ? "게시글 편집" : "새 게시글"}
        description="저장 즉시 Supabase 데이터가 갱신됩니다."
      >
        <form className="space-y-3" onSubmit={onSubmit}>
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

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">부제목</label>
            <Input
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="설명"
              required
            />
          </div>

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              썸네일 업로드(선택)
            </p>
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
                placeholder="https://... 또는 비워두기"
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
              현재 썸네일: {isUploadingThumbnail ? "업로드 중..." : form.thumbnail || "설정 안 함"}
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

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusRadioGroup
                legend="공개 상태"
                name="post-status"
                value={form.status}
                options={[
                  { value: "published", label: "공개" },
                  { value: "draft", label: "비공개" },
                ]}
                onChange={(value) =>
                  setForm((prev) => {
                    const nextStatus = value as PublishStatus;

                    if (nextStatus === "draft") {
                      return {
                        ...prev,
                        status: nextStatus,
                        featured: false,
                        scheduledPublishAt: "",
                      };
                    }

                    return {
                      ...prev,
                      status: nextStatus,
                    };
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
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-muted">
                  실제 게시일
                </label>
                <div>
                  <Input
                    value={toDisplayDateTime(form.publishedAt || null)}
                    readOnly
                    className={cn("lg:w-1/2!")}
                  />
                  <p className="text-[11px] text-muted">
                    최초 공개 시점이 자동 저장되며 이후 수정 시 유지됩니다.
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-muted">
                  예약 발행
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="datetime-local"
                    value={form.scheduledPublishAt}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        scheduledPublishAt: event.target.value,
                      }))
                    }
                    disabled={form.status !== "published"}
                    className={cn("lg:w-1/2!")}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        scheduledPublishAt: "",
                      }))
                    }
                    disabled={form.status !== "published" || !form.scheduledPublishAt}
                  >
                    해제
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <SurfaceCard tone="background" radius="lg" padding="sm" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">태그</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.tagInput}
                onChange={(event) => setForm((prev) => ({ ...prev, tagInput: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="태그를 입력하고 Enter"
              />
              <Button type="button" className="h-10 shrink-0 px-4" onClick={addTag}>
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.length > 0 ? (
                form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      className="text-red-600/80 transition-colors hover:text-red-500 dark:text-red-300/85 dark:hover:text-red-200"
                      aria-label={`${tag} 삭제`}
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-muted">아직 추가된 태그가 없습니다.</p>
              )}
            </div>
          </SurfaceCard>

          <MarkdownField
            label="본문"
            value={form.bodyMarkdown}
            onChange={(value) => setForm((prev) => ({ ...prev, bodyMarkdown: value }))}
            placeholder="Markdown 본문"
            minHeight={320}
            required
          />

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "저장 중..." : editingId ? "저장" : "게시글 생성"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(editingId)}
                disabled={isPending}
                aria-label="게시글 삭제"
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
