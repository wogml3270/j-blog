"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProfileContent } from "@/types/content";

type HomeManagerProps = {
  initialHome: ProfileContent;
};

type HomeFormState = {
  name: string;
  title: string;
  summary: string;
  techStackText: string;
};

function toFormState(profile: ProfileContent): HomeFormState {
  return {
    name: profile.name,
    title: profile.title,
    summary: profile.summary,
    techStackText: profile.techStack.join(", "),
  };
}

function parseTechStack(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

function serializeForm(form: HomeFormState): string {
  return JSON.stringify({
    name: form.name.trim(),
    title: form.title.trim(),
    summary: form.summary.trim(),
    techStack: parseTechStack(form.techStackText),
  });
}

export function HomeManager({ initialHome }: HomeManagerProps) {
  const initialForm = useMemo(() => toFormState(initialHome), [initialHome]);
  const [form, setForm] = useState<HomeFormState>(initialForm);
  const [savedForm, setSavedForm] = useState<HomeFormState>(initialForm);
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const isDirty = serializeForm(form) !== serializeForm(savedForm);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          summary: form.summary,
          techStack: parseTechStack(form.techStackText),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "홈 데이터 저장에 실패했습니다.");
      }

      const payload = (await response.json()) as { home?: ProfileContent };
      const next = payload.home ? toFormState(payload.home) : form;
      setForm(next);
      setSavedForm(next);
      setNotice({ kind: "success", text: "홈 정보를 저장했습니다." });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="ui-strong-motion mx-auto w-full space-y-4">
      <header className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <p className="text-sm text-muted">홈 화면의 히어로/기술스택 데이터를 관리합니다.</p>
        <p className="mt-1 text-xs text-muted">드로어 없이 이 화면에서 바로 수정/저장할 수 있습니다.</p>
      </header>

      <form
        className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-300 hover:shadow-md"
        onSubmit={onSubmit}
      >
        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>

        <Input
          value={form.summary}
          onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          placeholder="홈 소개 요약"
          required
        />

        <textarea
          value={form.techStackText}
          onChange={(event) => setForm((prev) => ({ ...prev, techStackText: event.target.value }))}
          className="min-h-[110px] w-full rounded-md border border-border bg-background p-3 text-sm transition-colors focus:border-foreground/30"
          placeholder="기술 스택 (쉼표 또는 줄바꿈 구분)"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={
              isDirty
                ? "rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                : "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
            }
          >
            {isDirty ? "변경 사항 있음" : "저장된 상태"}
          </span>

          <Button type="submit" disabled={!isDirty || isPending}>
            {isPending ? "저장 중..." : "홈 저장"}
          </Button>
        </div>
      </form>

      {notice ? (
        <p
          className={
            notice.kind === "success"
              ? "text-sm text-emerald-700 dark:text-emerald-300"
              : "text-sm text-red-600"
          }
        >
          {notice.text}
        </p>
      ) : null}
    </section>
  );
}
