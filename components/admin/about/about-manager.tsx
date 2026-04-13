"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useRef, useState } from "react";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { uploadAdminMediaFile } from "@/lib/admin/upload-client";
import { cn } from "@/lib/utils/cn";
import { useBeforeUnloadUnsavedChanges } from "@/lib/utils/unsaved-changes";
import { useAdminUnsavedStore } from "@/stores/admin-unsaved";
import type { ProfileContent } from "@/types/profile";
import type { ThumbnailInputMode } from "@/types/ui";

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
  aboutPhotoUrl: string;
  aboutTechItems: AboutTechFormItem[];
  techNameInput: string;
  techDescriptionInput: string;
  techLogoUrlInput: string;
};

type AboutTechLogoInputMode = ThumbnailInputMode | "svg";

function toFormState(profile: ProfileContent): AboutFormState {
  return {
    name: profile.name,
    title: profile.title,
    summary: profile.summary,
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
  };
}

function serializeForm(form: AboutFormState): string {
  return JSON.stringify({
    name: form.name.trim(),
    title: form.title.trim(),
    summary: form.summary.trim(),
    aboutPhotoUrl: form.aboutPhotoUrl.trim(),
    aboutTechItems: form.aboutTechItems.map((item) => ({
      name: item.name.trim(),
      description: item.description.trim(),
      logoUrl: item.logoUrl.trim(),
    })),
  });
}

function reorderById<T extends { id: string }>(items: T[], event: DragEndEvent): T[] {
  const { active, over } = event;

  if (!over || active.id === over.id) {
    return items;
  }

  const oldIndex = items.findIndex((item) => item.id === active.id);
  const newIndex = items.findIndex((item) => item.id === over.id);

  if (oldIndex < 0 || newIndex < 0) {
    return items;
  }

  return arrayMove(items, oldIndex, newIndex);
}

function validateSvgMarkup(markup: string): { valid: boolean; message?: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, "image/svg+xml");

  if (doc.querySelector("parsererror")) {
    return { valid: false, message: "SVG 문법이 올바르지 않습니다." };
  }

  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== "svg") {
    return { valid: false, message: "최상위 태그는 <svg>여야 합니다." };
  }

  if (doc.querySelector("script")) {
    return { valid: false, message: "보안을 위해 script 태그는 허용되지 않습니다." };
  }

  const hasUnsafeAttribute = Array.from(doc.querySelectorAll("*")).some((element) =>
    Array.from(element.attributes).some((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith("on")) {
        return true;
      }

      if ((name === "href" || name.endsWith(":href")) && value.startsWith("javascript:")) {
        return true;
      }

      return false;
    }),
  );

  if (hasUnsafeAttribute) {
    return { valid: false, message: "보안을 위해 이벤트/script 링크 속성은 허용되지 않습니다." };
  }

  return { valid: true };
}

function SortableAboutTechItem({
  item,
  onChange,
  onRemove,
}: {
  item: AboutTechFormItem;
  onChange: (next: AboutTechFormItem) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "space-y-2 rounded-md border border-border bg-surface p-3",
        isDragging ? "shadow-lg" : "",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.logoUrl} alt="" className="h-5 w-5 rounded-sm bg-black/15 p-0.5" />
          <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded border border-border text-xs text-muted active:cursor-grabbing"
            aria-label="순서 이동"
            title="순서 이동"
            {...attributes}
            {...listeners}
          >
            ≡
          </button>
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            삭제
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          value={item.name}
          onChange={(event) => onChange({ ...item, name: event.target.value })}
          placeholder="기술명"
        />
        <Input
          value={item.logoUrl}
          onChange={(event) => onChange({ ...item, logoUrl: event.target.value })}
          placeholder="로고 URL"
        />
      </div>

      <textarea
        value={item.description}
        onChange={(event) => onChange({ ...item, description: event.target.value })}
        className="min-h-[78px] w-full rounded-md border border-border bg-background p-3 text-sm transition-colors focus:border-foreground/30"
        placeholder="기술 설명"
      />
    </li>
  );
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
  const [aboutPhotoMode, setAboutPhotoMode] = useState<ThumbnailInputMode>("url");
  const [techLogoMode, setTechLogoMode] = useState<AboutTechLogoInputMode>("url");
  const [techLogoSvgInput, setTechLogoSvgInput] = useState("");
  const [localAboutPhotoPreview, setLocalAboutPhotoPreview] = useState<string | null>(null);
  const [localTechLogoPreview, setLocalTechLogoPreview] = useState<string | null>(null);
  const [isUploadingAboutPhoto, setIsUploadingAboutPhoto] = useState(false);
  const [isUploadingTechLogo, setIsUploadingTechLogo] = useState(false);
  const aboutPhotoUploadRequestRef = useRef(0);
  const techLogoUploadRequestRef = useRef(0);
  const setUnsavedDirty = useAdminUnsavedStore((state) => state.setDirty);

  const isDirty = serializeForm(form) !== serializeForm(savedForm);
  useBeforeUnloadUnsavedChanges(isDirty);

  useEffect(() => {
    setUnsavedDirty("about", isDirty);
    return () => {
      setUnsavedDirty("about", false);
    };
  }, [isDirty, setUnsavedDirty]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 기술 항목은 이름/설명/로고 URL이 모두 채워졌을 때만 추가한다.
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

    setTechLogoSvgInput("");
    setTechLogoMode("url");
    setLocalTechLogoPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return null;
    });
  };

  const removeTechItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      aboutTechItems: prev.aboutTechItems.filter((item) => item.id !== id),
    }));
  };

  // 기술 항목 순서를 드래그 결과 순서로 재배치한다.
  const onTechItemsDragEnd = (event: DragEndEvent) => {
    setForm((prev) => ({
      ...prev,
      aboutTechItems: reorderById(prev.aboutTechItems, event),
    }));
  };

  // 프로필 사진 파일을 선택하면 로컬 미리보기를 먼저 보여주고 즉시 업로드한다.
  const uploadAboutPhotoImmediately = async (file: File) => {
    const requestId = aboutPhotoUploadRequestRef.current + 1;
    aboutPhotoUploadRequestRef.current = requestId;
    setIsUploadingAboutPhoto(true);
    setNotice(null);

    try {
      const payload = await uploadAdminMediaFile(file, "about");

      if (!payload.url) {
        throw new Error("프로필 이미지 URL을 확인할 수 없습니다.");
      }

      if (requestId !== aboutPhotoUploadRequestRef.current) {
        return;
      }

      setForm((prev) => ({
        ...prev,
        aboutPhotoUrl: payload.url,
      }));
      setNotice({ kind: "success", text: "프로필 이미지를 업로드했습니다." });
    } catch (error) {
      if (requestId !== aboutPhotoUploadRequestRef.current) {
        return;
      }

      setNotice({
        kind: "error",
        text:
          error instanceof Error ? error.message : "프로필 이미지 업로드 중 오류가 발생했습니다.",
      });
    } finally {
      if (requestId === aboutPhotoUploadRequestRef.current) {
        setIsUploadingAboutPhoto(false);
      }
    }
  };

  const onSelectAboutPhotoFile = (file: File | null) => {
    if (!file) {
      setLocalAboutPhotoPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
      return;
    }

    const nextPreview = URL.createObjectURL(file);

    setLocalAboutPhotoPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return nextPreview;
    });
    void uploadAboutPhotoImmediately(file);
  };

  // 기술 로고 파일을 선택하면 로컬 미리보기를 먼저 보여주고 즉시 업로드한다.
  const uploadTechLogoImmediately = async (file: File) => {
    const requestId = techLogoUploadRequestRef.current + 1;
    techLogoUploadRequestRef.current = requestId;
    setIsUploadingTechLogo(true);
    setNotice(null);

    try {
      const payload = await uploadAdminMediaFile(file, "about");

      if (!payload.url) {
        throw new Error("기술 로고 URL을 확인할 수 없습니다.");
      }

      if (requestId !== techLogoUploadRequestRef.current) {
        return;
      }

      setForm((prev) => ({
        ...prev,
        techLogoUrlInput: payload.url,
      }));
      setNotice({ kind: "success", text: "기술 로고 이미지를 업로드했습니다." });
    } catch (error) {
      if (requestId !== techLogoUploadRequestRef.current) {
        return;
      }

      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "기술 로고 업로드 중 오류가 발생했습니다.",
      });
    } finally {
      if (requestId === techLogoUploadRequestRef.current) {
        setIsUploadingTechLogo(false);
      }
    }
  };

  const onSelectTechLogoFile = (file: File | null) => {
    if (!file) {
      setLocalTechLogoPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return null;
      });
      return;
    }

    const nextPreview = URL.createObjectURL(file);

    setLocalTechLogoPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return nextPreview;
    });
    void uploadTechLogoImmediately(file);
  };

  // SVG 태그 문자열도 기술 로고로 업로드할 수 있게 파일로 변환해 처리한다.
  const onUploadTechLogoSvg = async () => {
    const markup = techLogoSvgInput.trim();

    if (!markup) {
      setNotice({ kind: "error", text: "SVG 코드를 입력해주세요." });
      return;
    }

    const validation = validateSvgMarkup(markup);
    if (!validation.valid) {
      setNotice({ kind: "error", text: validation.message ?? "유효한 SVG가 아닙니다." });
      return;
    }

    const file = new File([markup], `about-tech-logo-${Date.now()}.svg`, {
      type: "image/svg+xml",
    });
    const previewUrl = URL.createObjectURL(file);

    setLocalTechLogoPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return previewUrl;
    });

    await uploadTechLogoImmediately(file);
  };

  // 단순화된 About 모델(name/title/summary/photo/tech) 기준으로 저장한다.
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
          aboutPhotoUrl: form.aboutPhotoUrl,
          aboutTechItems: form.aboutTechItems.map((item) => ({
            name: item.name.trim(),
            description: item.description.trim(),
            logoUrl: item.logoUrl.trim(),
          })),
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

  useEffect(() => {
    return () => {
      if (localAboutPhotoPreview) {
        URL.revokeObjectURL(localAboutPhotoPreview);
      }
    };
  }, [localAboutPhotoPreview]);

  useEffect(() => {
    return () => {
      if (localTechLogoPreview) {
        URL.revokeObjectURL(localTechLogoPreview);
      }
    };
  }, [localTechLogoPreview]);

  return (
    <ManagerShell
      title="소개 관리"
      summary="소개 페이지 콘텐츠를 단순 모델로 관리합니다."
      detail="이름, 직함, 한 줄 소개, 프로필 이미지, 기술 항목만 관리합니다."
      motion
    >
      <SurfaceCard
        tone="surface"
        radius="2xl"
        padding="md"
        interactive
        className="space-y-4 sm:p-5"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">프로필 이미지</h3>
              <p className="text-xs text-muted">공개 About 카드에서 사용하는 대표 사진입니다.</p>
            </div>

            <div className="space-y-2 rounded-md border border-border bg-background/70 p-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={aboutPhotoMode === "url" ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setAboutPhotoMode("url")}
                >
                  외부 링크
                </Button>
                <Button
                  type="button"
                  variant={aboutPhotoMode === "upload" ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setAboutPhotoMode("upload")}
                >
                  파일 업로드
                </Button>
              </div>

              {aboutPhotoMode === "url" ? (
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
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(event) => onSelectAboutPhotoFile(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5"
                  />
                  <p className="text-xs text-muted">
                    파일을 선택하면 즉시 미리보기와 업로드가 진행됩니다.
                  </p>
                </div>
              )}

              <p className="truncate text-xs text-muted">
                현재 이미지:{" "}
                {isUploadingAboutPhoto ? "업로드 중..." : form.aboutPhotoUrl || "설정되지 않음"}
              </p>
            </div>

            {localAboutPhotoPreview || form.aboutPhotoUrl.trim() ? (
              <div className="overflow-hidden rounded-md border border-border bg-surface p-3">
                <div className="relative h-44 w-full rounded-md border border-border bg-background/80 sm:h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={localAboutPhotoPreview || form.aboutPhotoUrl}
                    alt="프로필 사진 미리보기"
                    className="h-full w-full object-contain object-center"
                  />
                </div>
              </div>
            ) : null}
          </SurfaceCard>
          <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">기본 정보</h3>
              <p className="text-xs text-muted">소개 카드의 핵심 텍스트를 관리합니다.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
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

            <textarea
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
              className="min-h-[110px] w-full rounded-md border border-border bg-surface p-3 text-sm leading-7 transition-colors focus:border-foreground/30"
              placeholder="한 줄 소개/자기소개"
              required
            />
          </SurfaceCard>

          <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">기술 항목</h3>
              <p className="text-xs text-muted">
                순서 변경, 수정, 삭제가 가능한 기술 카드 목록입니다.
              </p>
            </div>

            <div className="space-y-2 rounded-md border border-border bg-background/70 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                기술 로고 업로드
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={techLogoMode === "url" ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setTechLogoMode("url")}
                >
                  외부 링크
                </Button>
                <Button
                  type="button"
                  variant={techLogoMode === "upload" ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setTechLogoMode("upload")}
                >
                  파일 업로드
                </Button>
                <Button
                  type="button"
                  variant={techLogoMode === "svg" ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setTechLogoMode("svg")}
                >
                  SVG 코드
                </Button>
              </div>

              {techLogoMode === "url" ? null : techLogoMode === "upload" ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(event) => onSelectTechLogoFile(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5"
                  />
                  <p className="text-xs text-muted">
                    파일을 선택하면 즉시 미리보기와 업로드가 진행됩니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={techLogoSvgInput}
                    onChange={(event) => setTechLogoSvgInput(event.target.value)}
                    className="min-h-[120px] w-full rounded-md border border-border bg-surface p-3 text-xs transition-colors focus:border-foreground/30"
                    placeholder="<svg ...>...</svg>"
                  />
                  <Button
                    type="button"
                    onClick={onUploadTechLogoSvg}
                    disabled={!techLogoSvgInput.trim() || isUploadingTechLogo}
                  >
                    {isUploadingTechLogo ? "업로드 중..." : "SVG 코드 업로드"}
                  </Button>
                </div>
              )}

              <p className="truncate text-xs text-muted">
                현재 로고:{" "}
                {isUploadingTechLogo ? "업로드 중..." : form.techLogoUrlInput || "설정되지 않음"}
              </p>
            </div>

            {localTechLogoPreview || form.techLogoUrlInput.trim() ? (
              <div className="overflow-hidden rounded-md border border-border bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={localTechLogoPreview || form.techLogoUrlInput}
                  alt="기술 로고 미리보기"
                  className="h-12 w-12 rounded-sm object-contain"
                />
              </div>
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onTechItemsDragEnd}
            >
              <SortableContext
                items={form.aboutTechItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {form.aboutTechItems.map((item) => (
                    <SortableAboutTechItem
                      key={item.id}
                      item={item}
                      onChange={(next) =>
                        setForm((prev) => ({
                          ...prev,
                          aboutTechItems: prev.aboutTechItems.map((target) =>
                            target.id === item.id ? next : target,
                          ),
                        }))
                      }
                      onRemove={() => removeTechItem(item.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </SurfaceCard>

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
