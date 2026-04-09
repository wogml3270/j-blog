"use client";

import { useMemo, useState } from "react";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { StatusRadioGroup } from "@/components/admin/common/status-radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";
import type { PublishStatus } from "@/types/db";
import type { ProfileContent } from "@/types/profile";

type AboutManagerProps = {
  initialAbout: ProfileContent;
};

type AboutTechFormItem = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
};

type AboutFormState = {
  name: string;
  title: string;
  summary: string;
  techStack: string[];
  techStackInput: string;
  introDescription: string;
  aboutPhotoUrl: string;
  aboutTechItems: AboutTechFormItem[];
  techNameInput: string;
  techDescriptionInput: string;
  techLogoUrlInput: string;
  aboutExperience: string;
  strengthsText: string;
  workStyle: string;
  status: PublishStatus;
};

function toFormState(profile: ProfileContent): AboutFormState {
  return {
    name: profile.name,
    title: profile.title,
    summary: profile.summary,
    techStack: [...profile.techStack],
    techStackInput: "",
    introDescription: profile.aboutIntroDescriptionKo,
    aboutPhotoUrl: profile.aboutPhotoUrl,
    aboutTechItems: profile.aboutTechItems.map((item, index) => ({
      id: `${item.name}-${index}`,
      name: item.name,
      description: item.description,
      logoUrl: item.logoUrl,
    })),
    techNameInput: "",
    techDescriptionInput: "",
    techLogoUrlInput: "",
    aboutExperience: profile.aboutExperience,
    strengthsText: profile.strengths.join("\n"),
    workStyle: profile.workStyle,
    status: profile.status,
  };
}

function uniqueStringList(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function parseStrengths(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeForm(form: AboutFormState): string {
  return JSON.stringify({
    name: form.name.trim(),
    title: form.title.trim(),
    summary: form.summary.trim(),
    techStack: uniqueStringList(form.techStack),
    introDescription: form.introDescription.trim(),
    aboutPhotoUrl: form.aboutPhotoUrl.trim(),
    aboutTechItems: form.aboutTechItems.map((item) => ({
      name: item.name.trim(),
      description: item.description.trim(),
      logoUrl: item.logoUrl.trim(),
    })),
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
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const isDirty = serializeForm(form) !== serializeForm(savedForm);

  // 홈 기술 스택은 Enter/추가 버튼으로 한 항목씩 관리한다.
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

  // 기술 스택 항목은 이름+설명+로고 URL 3개가 모두 있는 경우에만 추가한다.
  const addTechItem = () => {
    const name = form.techNameInput.trim();
    const description = form.techDescriptionInput.trim();
    const logoUrl = form.techLogoUrlInput.trim();

    if (!name || !description || !logoUrl) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      aboutTechItems: [
        ...prev.aboutTechItems,
        { id: `${name}-${Date.now()}`, name, description, logoUrl },
      ],
      techNameInput: "",
      techDescriptionInput: "",
      techLogoUrlInput: "",
    }));
  };

  const removeTechItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      aboutTechItems: prev.aboutTechItems.filter((item) => item.id !== id),
    }));
  };

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
          name: form.name,
          title: form.title,
          summary: form.summary,
          techStack: uniqueStringList(form.techStack),
          introDescription: form.introDescription,
          aboutPhotoUrl: form.aboutPhotoUrl,
          aboutTechItems: form.aboutTechItems.map((item) => ({
            name: item.name.trim(),
            description: item.description.trim(),
            logoUrl: item.logoUrl.trim(),
          })),
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
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-semibold",
              statusBadge(form.status),
            )}
          >
            {toStatusLabel(form.status)}
          </span>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">기본 정보</h3>
              <p className="text-xs text-muted">기본 프로필을 관리합니다.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="이름"
                required
              />
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="직함"
                required
              />
            </div>

            <Input
              value={form.summary}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  summary: event.target.value,
                }))
              }
              placeholder="한 줄 소개"
              required
            />
          </SurfaceCard>

          <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-2 sm:p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">About</h3>
              <p className="text-xs text-muted">소개 상단 문구와 본문 설명을 관리합니다.</p>
            </div>
            <textarea
              value={form.introDescription}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  introDescription: event.target.value,
                }))
              }
              className="min-h-[86px] w-full rounded-md border border-border bg-surface p-3 text-sm transition-colors focus:border-foreground/30"
              placeholder="About 섹션 설명(KO)"
              required
            />
            <textarea
              value={form.aboutExperience}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  aboutExperience: event.target.value,
                }))
              }
              className="min-h-[116px] w-full rounded-md border border-border bg-surface p-3 text-sm transition-colors focus:border-foreground/30"
              placeholder="소개 경험 문단"
              required
            />
          </SurfaceCard>

          <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">프로필/기술 스택 미디어</h3>
              <p className="text-xs text-muted">About 오른쪽 사진과 기술 로고/설명을 관리합니다.</p>
            </div>

            <Input
              value={form.aboutPhotoUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  aboutPhotoUrl: event.target.value,
                }))
              }
              placeholder="프로필 사진 URL"
              required
            />

            {form.aboutPhotoUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.aboutPhotoUrl}
                alt="프로필 사진 미리보기"
                className="h-40 w-full rounded-md border border-border object-cover sm:h-52"
              />
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={form.techNameInput}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    techNameInput: event.target.value,
                  }))
                }
                placeholder="기술명"
              />
              <Input
                value={form.techLogoUrlInput}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    techLogoUrlInput: event.target.value,
                  }))
                }
                placeholder="로고 URL"
              />
            </div>
            <textarea
              value={form.techDescriptionInput}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  techDescriptionInput: event.target.value,
                }))
              }
              className="min-h-[78px] w-full rounded-md border border-border bg-surface p-3 text-sm transition-colors focus:border-foreground/30"
              placeholder="기술 설명"
            />
            <Button type="button" variant="outline" onClick={addTechItem}>
              기술 항목 추가
            </Button>

            <ul className="grid gap-2 sm:grid-cols-2">
              {form.aboutTechItems.map((item) => (
                <li key={item.id}>
                  <article className="space-y-2 rounded-md border border-border bg-surface p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.logoUrl}
                          alt=""
                          className="h-5 w-5 rounded-sm bg-black/15 p-0.5"
                        />
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTechItem(item.id)}
                      >
                        삭제
                      </Button>
                    </div>
                    <p className="text-xs leading-5 text-muted">{item.description}</p>
                  </article>
                </li>
              ))}
            </ul>
          </SurfaceCard>

          <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-2 sm:p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">핵심 역량</h3>
              <p className="text-xs text-muted">한 줄에 한 항목씩 입력하세요.</p>
            </div>
            <textarea
              value={form.strengthsText}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  strengthsText: event.target.value,
                }))
              }
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
