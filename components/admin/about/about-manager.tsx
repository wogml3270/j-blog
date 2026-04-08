"use client";

import { useMemo, useState } from "react";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { StatusRadioGroup } from "@/components/admin/common/status-radio-group";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";
import type { ProfileContent } from "@/types/profile";
import type { PublishStatus } from "@/types/db";

type AboutManagerProps = {
  initialAbout: ProfileContent;
};

type AboutFormState = {
  introDescription: string;
  aboutExperience: string;
  strengthsText: string;
  workStyle: string;
  status: PublishStatus;
};

function toFormState(profile: ProfileContent): AboutFormState {
  return {
    introDescription: profile.aboutIntroDescriptionKo,
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

function serializeForm(form: AboutFormState): string {
  return JSON.stringify({
    introDescription: form.introDescription.trim(),
    aboutExperience: form.aboutExperience.trim(),
    strengths: parseStrengths(form.strengthsText),
    workStyle: form.workStyle.trim(),
    status: form.status,
  });
}

function statusBadge(status: PublishStatus): string {
  return status === "published"
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    : "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300";
}

function toStatusLabel(status: PublishStatus): string {
  return status === "published" ? "공개" : "비공개";
}

export function AboutManager({ initialAbout }: AboutManagerProps) {
  const initialForm = useMemo(() => toFormState(initialAbout), [initialAbout]);
  const [form, setForm] = useState<AboutFormState>(initialForm);
  const [savedForm, setSavedForm] = useState<AboutFormState>(initialForm);
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const isDirty = serializeForm(form) !== serializeForm(savedForm);

  // 소개 섹션은 KO DB 값을 기준으로 저장하므로 문자열 정규화를 서버 요청 전에 수행한다.
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          introDescription: form.introDescription,
          aboutExperience: form.aboutExperience,
          strengths: parseStrengths(form.strengthsText),
          workStyle: form.workStyle,
          status: form.status,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "소개 데이터 저장에 실패했습니다.");
      }

      const payload = (await response.json()) as { about?: ProfileContent };
      const next = payload.about ? toFormState(payload.about) : form;
      setForm(next);
      setSavedForm(next);
      setNotice({ kind: "success", text: "소개 정보를 저장했습니다." });
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
    <ManagerShell
      motion
      summary="소개 페이지 콘텐츠를 관리합니다."
      detail="KO 소개 문구는 DB에서 관리되고, EN/JA는 locale 문구를 유지합니다."
    >
      <SurfaceCard
        tone="surface"
        radius="2xl"
        padding="md"
        interactive
        className="space-y-4 sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", statusBadge(form.status))}>
            {toStatusLabel(form.status)}
          </span>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
        <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-2 sm:p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">About</h3>
            <p className="text-xs text-muted">소개 상단 문구와 본문 설명을 관리합니다.</p>
          </div>
          <textarea
            value={form.introDescription}
            onChange={(event) => setForm((prev) => ({ ...prev, introDescription: event.target.value }))}
            className="min-h-[86px] w-full rounded-md border border-border bg-surface p-3 text-sm transition-colors focus:border-foreground/30"
            placeholder="About 섹션 설명(KO)"
            required
          />
          <textarea
            value={form.aboutExperience}
            onChange={(event) => setForm((prev) => ({ ...prev, aboutExperience: event.target.value }))}
            className="min-h-[116px] w-full rounded-md border border-border bg-surface p-3 text-sm transition-colors focus:border-foreground/30"
            placeholder="소개 경험 문단"
            required
          />
        </SurfaceCard>

        <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-2 sm:p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">핵심 역량</h3>
            <p className="text-xs text-muted">한 줄에 한 항목씩 입력하세요.</p>
          </div>
          <textarea
            value={form.strengthsText}
            onChange={(event) => setForm((prev) => ({ ...prev, strengthsText: event.target.value }))}
            className="min-h-[112px] w-full rounded-md border border-border bg-surface p-3 text-sm transition-colors focus:border-foreground/30"
            placeholder="강점 (줄바꿈 구분)"
          />
        </SurfaceCard>

        <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-2 sm:p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">작업 방식</h3>
            <p className="text-xs text-muted">협업 스타일과 전달 방식을 설명합니다.</p>
          </div>
          <textarea
            value={form.workStyle}
            onChange={(event) => setForm((prev) => ({ ...prev, workStyle: event.target.value }))}
            className="min-h-[112px] w-full rounded-md border border-border bg-surface p-3 text-sm transition-colors focus:border-foreground/30"
            placeholder="업무 스타일"
            required
          />
        </SurfaceCard>

        <StatusRadioGroup
          legend="공개 상태"
          name="about-status"
          value={form.status}
          options={[
            { value: "published", label: "공개" },
            { value: "draft", label: "비공개" },
          ]}
          onChange={(value) => setForm((prev) => ({ ...prev, status: value as PublishStatus }))}
          className="sm:p-4"
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
            {isPending ? "저장 중..." : "소개 저장"}
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
