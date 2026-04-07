"use client";

import { useState } from "react";
import { EditorDrawer } from "@/components/admin/editor-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { ProfileContent, PublishStatus } from "@/types/content";

interface ProfileManagerProps {
  initialProfile: ProfileContent;
};

interface ProfileFormState {
  name: string;
  title: string;
  summary: string;
  aboutExperience: string;
  strengthsText: string;
  workStyle: string;
  status: PublishStatus;
};

function toFormState(profile: ProfileContent): ProfileFormState {
  return {
    name: profile.name,
    title: profile.title,
    summary: profile.summary,
    aboutExperience: profile.aboutExperience,
    strengthsText: profile.strengths.join("\n"),
    workStyle: profile.workStyle,
    status: profile.status,
  };
}

function parseStrengths(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function statusBadge(status: PublishStatus): string {
  return status === "published"
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

export function ProfileManager({ initialProfile }: ProfileManagerProps) {
  const [form, setForm] = useState<ProfileFormState>(toFormState(initialProfile));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          summary: form.summary,
          aboutExperience: form.aboutExperience,
          strengths: parseStrengths(form.strengthsText),
          workStyle: form.workStyle,
          status: form.status,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "프로필 저장에 실패했습니다.");
      }

      const payload = (await response.json()) as { profile?: ProfileContent };

      if (payload.profile) {
        setForm(toFormState(payload.profile));
      }

      setMessage("프로필을 저장했습니다.");
      setDrawerOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <section className="mx-auto w-full space-y-4">
        <header className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted">프로필은 단일 레코드로 관리됩니다.</p>
          <p className="text-xs text-muted">행을 클릭하면 오른쪽 패널에서 수정할 수 있습니다.</p>
        </header>

        <ul className="overflow-hidden rounded-xl border border-border bg-surface">
          <li className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5"
            >
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge(form.status))}>
                {form.status === "published" ? "공개" : "비공개"}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {form.name} · {form.title}
              </span>
              <span className="text-xs text-muted">profile</span>
            </button>
          </li>
        </ul>

        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </section>

      <EditorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="프로필 편집"
        description="홈/어바웃에 노출되는 핵심 텍스트를 수정합니다."
      >
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="이름"
            required
          />
          <Input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="직함"
            required
          />
          <Input
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
            placeholder="홈 소개 요약"
            required
          />

          <textarea
            value={form.aboutExperience}
            onChange={(event) => setForm((prev) => ({ ...prev, aboutExperience: event.target.value }))}
            className="min-h-[120px] w-full rounded-md border border-border bg-background p-3 text-sm"
            placeholder="소개 경험 문단"
            required
          />

          <textarea
            value={form.strengthsText}
            onChange={(event) => setForm((prev) => ({ ...prev, strengthsText: event.target.value }))}
            className="min-h-[120px] w-full rounded-md border border-border bg-background p-3 text-sm"
            placeholder="강점 (줄바꿈 구분)"
          />

          <textarea
            value={form.workStyle}
            onChange={(event) => setForm((prev) => ({ ...prev, workStyle: event.target.value }))}
            className="min-h-[120px] w-full rounded-md border border-border bg-background p-3 text-sm"
            placeholder="업무 스타일"
            required
          />

          <select
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as PublishStatus }))}
          >
            <option value="published">공개</option>
            <option value="draft">비공개</option>
          </select>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "저장 중..." : "프로필 저장"}
          </Button>

          {message ? <p className="text-sm text-muted">{message}</p> : null}
        </form>
      </EditorDrawer>
    </>
  );
}
