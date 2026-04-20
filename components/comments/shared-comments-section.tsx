"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { NoteIcon } from "@/components/ui/icons/note-icon";
import { TrashIcon } from "@/components/ui/icons/trash-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { normalizeAvatarUrl } from "@/lib/utils/avatar-url";

export interface CommentSectionLabels {
  title: string;
  description: string;
  signedInAs: string;
  signOut: string;
  signInHint: string;
  emailLabel: string;
  nicknameLabel: string;
  avatarLabel: string;
  contentLabel: string;
  contentPlaceholder: string;
  submit: string;
  submitting: string;
  empty: string;
  success: string;
  loginRequired: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  deleteConfirm: string;
  updateSuccess: string;
  deleteSuccess: string;
  edited: string;
  contentRequired: string;
}

type CommentBase = {
  id: string;
  authorUserId: string;
  authorEmail: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
};

type SharedCommentsSectionProps<TComment extends CommentBase> = {
  resourceSlug: string;
  slugFieldName: "postSlug" | "projectSlug";
  createEndpoint: string;
  itemEndpointBase: string;
  labels: CommentSectionLabels;
  initialComments: TComment[];
};

interface CommentFormState {
  content: string;
}

const EMPTY_FORM: CommentFormState = {
  content: "",
};

function getNicknameFromUser(user: User | null): string {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.user_name,
    metadata.preferred_username,
    metadata.nickname,
  ];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) {
      return item.trim();
    }
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "";
  }

  return "";
}

function getAvatarFromUser(user: User | null): string {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata ?? {};
  const candidates = [metadata.avatar_url, metadata.picture];

  for (const item of candidates) {
    const normalized = normalizeAvatarUrl(item);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function toDisplayDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SharedCommentsSection<TComment extends CommentBase>({
  resourceSlug,
  slugFieldName,
  createEndpoint,
  itemEndpointBase,
  labels,
  initialComments,
}: SharedCommentsSectionProps<TComment>) {
  const [comments, setComments] = useState<TComment[]>(initialComments);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthAvailable] = useState<boolean>(() => hasSupabasePublicEnv());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => hasSupabasePublicEnv());
  const [form, setForm] = useState<CommentFormState>(EMPTY_FORM);
  const [isPending, setIsPending] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nickname = useMemo(() => getNicknameFromUser(user), [user]);
  const avatarUrl = useMemo(() => getAvatarFromUser(user), [user]);
  const email = user?.email ?? "";

  const authLabel = useMemo(() => {
    if (!email) {
      return "";
    }

    return `${labels.signedInAs} ${email}`;
  }, [email, labels.signedInAs]);

  useEffect(() => {
    if (!isAuthAvailable) {
      setIsAuthLoading(false);
      return;
    }

    let supabase: ReturnType<typeof getSupabaseBrowserClient> | null = null;
    let isMounted = true;

    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      return;
    }

    const bootstrap = async () => {
      if (!supabase) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();

        if (!isMounted) {
          return;
        }

        setUser(data.user ?? null);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrap();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [isAuthAvailable]);

  // 성공 메시지는 잠깐 보여준 뒤 자동으로 정리해 누적을 방지한다.
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !email) {
      setErrorMessage(labels.loginRequired);
      return;
    }

    setIsPending(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const payload: Record<string, unknown> = {
        email,
        nickname: nickname || email.split("@")[0] || "user",
        avatarUrl: avatarUrl || undefined,
        content: form.content,
      };
      payload[slugFieldName] = resourceSlug;

      const response = await fetch(createEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json()) as {
        error?: string;
        comment?: TComment;
      };

      if (!response.ok || !responseBody.comment) {
        throw new Error(responseBody.error ?? "댓글 등록에 실패했습니다.");
      }

      setComments((prev) => [...prev, responseBody.comment as TComment]);
      setForm(EMPTY_FORM);
      setMessage(labels.success);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const startEdit = (comment: TComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setErrorMessage(null);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const onSaveEdit = async (commentId: string) => {
    if (!editingContent.trim()) {
      setErrorMessage(labels.contentRequired);
      return;
    }

    setPendingCommentId(commentId);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch(`${itemEndpointBase}/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editingContent,
        }),
      });

      const payload = (await response.json()) as { error?: string; comment?: TComment };

      if (!response.ok || !payload.comment) {
        throw new Error(payload.error ?? "댓글 수정에 실패했습니다.");
      }

      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? payload.comment ?? comment : comment)),
      );
      setEditingCommentId(null);
      setEditingContent("");
      setMessage(labels.updateSuccess);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setPendingCommentId(null);
    }
  };

  const onDeleteComment = async (commentId: string) => {
    if (!window.confirm(labels.deleteConfirm)) {
      return;
    }

    setPendingCommentId(commentId);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch(`${itemEndpointBase}/${commentId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string; id?: string };

      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "댓글 삭제에 실패했습니다.");
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingContent("");
      }
      setMessage(labels.deleteSuccess);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setPendingCommentId(null);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-3.5 sm:p-4">
      <div className="flex flex-col gap-3 justify-between md:flex-row">
        <header className="space-y-0.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{labels.title}</h2>
          {!user ? <p className="text-sm text-muted">{labels.description}</p> : null}
        </header>

        {user ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-2">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={nickname || "user"}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-semibold text-foreground">
                  {(nickname || email || "U").slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{nickname || email}</p>
                <p className="truncate text-xs text-muted">{authLabel}</p>
              </div>
            </div>
          </div>
        ) : !isAuthAvailable ? (
          <div className="rounded-lg border border-border bg-background px-2.5 py-2">
            <p className="text-sm text-muted">댓글 로그인을 위한 Supabase 설정이 필요합니다.</p>
          </div>
        ) : isAuthLoading ? (
          <div className="space-y-2 rounded-lg border border-border bg-background px-2.5 py-2">
            <Skeleton width="42%" height={13} />
            <Skeleton width="58%" height={13} />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background px-2.5 py-2">
            <p className="text-sm text-muted">{labels.signInHint}</p>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {isPending ? (
          <article className="rounded-lg border border-border bg-background p-2.5">
            <div className="mb-1.5 flex items-center gap-2">
              <Skeleton width={28} height={28} rounded="999px" />
              <div className="flex flex-col gap-1 space-y-1">
                <Skeleton width={92} height={14} rounded="0.35rem" />
                <Skeleton width={132} height={11} rounded="0.35rem" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton width="86%" height={14} rounded="0.35rem" />
            </div>
          </article>
        ) : null}
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-lg border border-border bg-background p-2.5"
            >
              <div className="mb-1.5 flex items-center gap-2">
                {comment.authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.authorAvatarUrl}
                    alt={comment.authorNickname}
                    className="h-7 w-7 rounded-full border border-border object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-semibold text-foreground">
                    {comment.authorNickname.slice(0, 1)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{comment.authorNickname}</p>
                  <p className="text-[11px] text-muted">
                    {toDisplayDate(comment.createdAt)}
                    {comment.updatedAt &&
                    comment.updatedAt !== comment.createdAt &&
                    new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime()
                      ? ` · ${labels.edited}`
                      : ""}
                  </p>
                </div>
              </div>
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    className="min-h-[78px] w-full rounded-md border border-border bg-surface p-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    disabled={pendingCommentId === comment.id}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      disabled={pendingCommentId === comment.id}
                    >
                      {labels.cancel}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void onSaveEdit(comment.id)}
                      disabled={pendingCommentId === comment.id}
                    >
                      {labels.save}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {comment.content}
                  </p>
                  {user && comment.authorUserId === user.id ? (
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(comment)}
                        disabled={pendingCommentId === comment.id}
                        aria-label={labels.edit}
                      >
                        <NoteIcon />
                        <span className="sr-only">{labels.edit}</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => void onDeleteComment(comment.id)}
                        disabled={pendingCommentId === comment.id}
                        aria-label={labels.delete}
                      >
                        <TrashIcon />
                        <span className="sr-only">{labels.delete}</span>
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-background px-4 py-4 text-center text-sm text-muted">
            {labels.empty}
          </p>
        )}
      </div>

      <form className="space-y-2.5" onSubmit={onSubmit}>
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {labels.contentLabel}
          </span>
          <textarea
            className="min-h-[78px] w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            placeholder={labels.contentPlaceholder}
            required
            disabled={!user || isPending}
          />
        </label>
        <div className="mt-3 flex justify-end">
          <Button
            type="submit"
            size="sm"
            className="w-full sm:w-auto"
            disabled={!user || !isAuthAvailable || isAuthLoading || isPending}
          >
            {isPending ? labels.submitting : labels.submit}
          </Button>
        </div>
      </form>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
    </section>
  );
}

