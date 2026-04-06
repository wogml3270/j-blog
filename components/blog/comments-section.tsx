"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { BlogComment } from "@/types/content";

type CommentsLabels = {
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

type CommentsSectionProps = {
  postSlug: string;
  nextPath: string;
  labels: CommentsLabels;
  initialComments: BlogComment[];
};

type CommentFormState = {
  email: string;
  nickname: string;
  avatarUrl: string;
  content: string;
};

const EMPTY_FORM: CommentFormState = {
  email: "",
  nickname: "",
  avatarUrl: "",
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
  nextPath,
  labels,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<CommentFormState>(EMPTY_FORM);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authLabel = useMemo(() => {
    if (!user?.email) {
      return "";
    }

    return `${labels.signedInAs} ${user.email}`;
  }, [labels.signedInAs, user?.email]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    let isMounted = true;

    const bootstrap = async () => {
      const {
        data: { user: initialUser },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(initialUser ?? null);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      nickname: prev.nickname || getNicknameFromUser(user),
      avatarUrl: prev.avatarUrl || getAvatarFromUser(user),
    }));
  }, [user]);

  const onSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setMessage(null);
    setErrorMessage(null);
    setComments(initialComments);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
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
          email: form.email,
          nickname: form.nickname,
          avatarUrl: form.avatarUrl || undefined,
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
      setForm((prev) => ({
        ...prev,
        content: "",
      }));
      setMessage(labels.success);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{labels.title}</h2>
        <p className="text-sm text-muted">{labels.description}</p>
      </header>

      {user ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <p className="text-sm text-muted">{authLabel}</p>
          <Button type="button" size="sm" variant="ghost" onClick={onSignOut}>
            {labels.signOut}
          </Button>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border border-border bg-background p-3">
          <p className="text-sm text-muted">{labels.signInHint}</p>
          <SocialLoginButtons nextPath={nextPath} variant="public" />
        </div>
      )}

      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {labels.emailLabel}
            </span>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="you@example.com"
              required
              disabled={!user || isPending}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {labels.nicknameLabel}
            </span>
            <Input
              value={form.nickname}
              onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
              placeholder="닉네임"
              required
              disabled={!user || isPending}
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {labels.avatarLabel}
          </span>
          <Input
            value={form.avatarUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
            placeholder="https://example.com/avatar.png"
            disabled={!user || isPending}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {labels.contentLabel}
          </span>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            placeholder={labels.contentPlaceholder}
            required
            disabled={!user || isPending}
          />
        </label>

        <Button type="submit" className="w-full sm:w-auto" disabled={!user || isPending}>
          {isPending ? labels.submitting : labels.submit}
        </Button>
      </form>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-border bg-background p-4">
              <div className="mb-2 flex items-center gap-3">
                {comment.authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.authorAvatarUrl}
                    alt={comment.authorNickname}
                    className="h-9 w-9 rounded-full border border-border object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-foreground">
                    {comment.authorNickname.slice(0, 1)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{comment.authorNickname}</p>
                  <p className="text-xs text-muted">{toDisplayDate(comment.createdAt)}</p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{comment.content}</p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted">
            {labels.empty}
          </p>
        )}
      </div>
    </section>
  );
}
