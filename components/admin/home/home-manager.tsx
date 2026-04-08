"use client";

import { useMemo, useState } from "react";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { ProfileContent } from "@/types/profile";

type HomeManagerProps = {
  initialHome: ProfileContent;
};

type HomeFormState = {
  name: string;
  title: string;
  summary: string;
  techStack: string[];
  techStackInput: string;
};

function toFormState(profile: ProfileContent): HomeFormState {
  return {
    name: profile.name,
    title: profile.title,
    summary: profile.summary,
    techStack: [...profile.techStack],
    techStackInput: "",
  };
}

function uniqueStringList(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function serializeForm(form: HomeFormState): string {
  return JSON.stringify({
    name: form.name.trim(),
    title: form.title.trim(),
    summary: form.summary.trim(),
    techStack: uniqueStringList(form.techStack),
  });
}

export function HomeManager({ initialHome }: HomeManagerProps) {
  const initialForm = useMemo(() => toFormState(initialHome), [initialHome]);
  const [form, setForm] = useState<HomeFormState>(initialForm);
  const [savedForm, setSavedForm] = useState<HomeFormState>(initialForm);
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const isDirty = serializeForm(form) !== serializeForm(savedForm);

  // 저장 payload를 한 곳에서 정규화해 서버와 클라이언트의 값 차이를 줄인다.
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
          techStack: uniqueStringList(form.techStack),
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

  // 기술 스택은 Enter/추가 버튼으로 한 항목씩 관리한다.
  const addTechStack = () => {
    const value = form.techStackInput.trim();

    if (!value) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      techStack: uniqueStringList([...prev.techStack, value]),
      techStackInput: "",
    }));
  };

  const removeTechStack = (value: string) => {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((item) => item !== value),
    }));
  };

  return (
    <ManagerShell
      motion
      summary="홈 화면의 히어로/기술스택 데이터를 관리합니다."
      detail="드로어 없이 이 화면에서 바로 수정/저장할 수 있습니다."
    >
      <SurfaceCard
        tone="surface"
        radius="2xl"
        padding="md"
        interactive
        className="space-y-4"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
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

          <div className="space-y-2 rounded-md border border-border bg-background p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">기술 스택</p>
            <div className="flex items-center gap-2">
              <Input
                className="min-w-0 flex-1"
                value={form.techStackInput}
                onChange={(event) => setForm((prev) => ({ ...prev, techStackInput: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTechStack();
                  }
                }}
                placeholder="기술명을 입력하고 Enter"
              />
              <Button type="button" className="h-10 shrink-0 px-4" onClick={addTechStack}>
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
                      onClick={() => removeTechStack(item)}
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
      </SurfaceCard>

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
    </ManagerShell>
  );
}
