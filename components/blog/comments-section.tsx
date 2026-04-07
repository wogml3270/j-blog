"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import type { BlogComment } from "@/types/content";

interface CommentsLabels {
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
};

interface CommentsSectionProps {
  postSlug: string;
  labels: CommentsLabels;
  initialComments: BlogComment[];
};

interface CommentFormState {
  content: string;
};

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
    if (typeof item === "string" && item.trim()) {
      return item.trim();
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

export function CommentsSection({
  postSlug,
  labels,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthAvailable] = useState<boolean>(() => hasSupabasePublicEnv());
  const [form, setForm] = useState<CommentFormState>(EMPTY_FORM);
  const [isPending, setIsPending] = useState(false);
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
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(data.user ?? null);
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [isAuthAvailable]);

  const onSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setMessage(null);
    setErrorMessage(null);
    setComments(initialComments);
  };

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
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postSlug,
          email,
          nickname: nickname || email.split("@")[0] || "user",
          avatarUrl: avatarUrl || undefined,
          content: form.content,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        comment?: BlogComment;
      };

      if (!response.ok || !payload.comment) {
        throw new Error(payload.error ?? "댓글 등록에 실패했습니다.");
      }

      setComments((prev) => [...prev, payload.comment as BlogComment]);
      setForm(EMPTY_FORM);
      setMessage(labels.success);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-3.5 sm:p-4">
      <header className="space-y-0.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{labels.title}</h2>
        <p className="text-sm text-muted">{labels.description}</p>
      </header>

      {user ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
          <div className="flex min-w-0 items-center gap-2">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={nickname || "user"} className="h-7 w-7 rounded-full object-cover" />
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
          <Button type="button" size="sm" variant="ghost" onClick={onSignOut}>
            {labels.signOut}
          </Button>
        </div>
      ) : !isAuthAvailable ? (
        <div className="rounded-lg border border-border bg-background px-2.5 py-2">
          <p className="text-sm text-muted">댓글 로그인을 위한 Supabase 설정이 필요합니다.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background px-2.5 py-2">
          <p className="text-sm text-muted">
            {labels.signInHint} (헤더의 로그인 버튼을 이용해주세요)
          </p>
        </div>
      )}

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

        <Button type="submit" size="sm" className="w-full sm:w-auto" disabled={!user || !isAuthAvailable || isPending}>
          {isPending ? labels.submitting : labels.submit}
        </Button>
      </form>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

      <div className="space-y-2.5">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-border bg-background p-2.5">
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
                  <p className="text-[11px] text-muted">{toDisplayDate(comment.createdAt)}</p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{comment.content}</p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-background px-4 py-4 text-center text-sm text-muted">
            {labels.empty}
          </p>
        )}
      </div>
    </section>
  );
}
