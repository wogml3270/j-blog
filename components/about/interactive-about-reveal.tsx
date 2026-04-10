"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { InteractiveAboutRevealProps } from "@/types/ui";

export function InteractiveAboutReveal({ profile, labels }: InteractiveAboutRevealProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 모션 위치 조정
  const profileButtonPosition = {
    // 모바일은 열림/닫힘 모두 동일 위치(상단 중앙)로 고정한다.
    base: "absolute left-1/2 top-0 -translate-x-1/2 translate-y-0 lg:top-1/2 lg:-translate-y-1/2",
    // 데스크톱에서만 우측 이동 애니메이션을 적용한다.
    expanded: "lg:left-4/5",
  } as const;

  // 기술 항목은 이름/설명/로고가 모두 있는 데이터만 노출한다.
  const techItems = useMemo(
    () =>
      profile.aboutTechItems.filter(
        (item) => item.name.trim() && item.description.trim() && item.logoUrl.trim(),
      ),
    [profile.aboutTechItems],
  );

  return (
    <section className="">
      <div className="relative min-h-[--home-hero-height] px-4 py-6 sm:px-6 sm:py-8">
        {/* 콘텐츠 모션은 래퍼에서만 처리해 레이아웃 점프를 줄인다. */}
        <div
          className={cn(
            "w-full overflow-hidden transform-gpu transition-[max-height,opacity,transform] duration-2000 ease-[cubic-bezier(0.22,1,0.36,1)] lg:max-w-[58%]",
            isExpanded
              ? "pointer-events-auto opacity-100 max-h-[1300px] translate-y-0 lg:translate-x-0"
              : "pointer-events-none max-h-0 opacity-0 translate-y-4 lg:max-h-[1200px] lg:opacity-0 lg:-translate-x-12",
          )}
        >
          <article className="w-full rounded-3xl border border-border/70 bg-background/70 p-4 pt-60 shadow-lg backdrop-blur-sm lg:pt-5">
            <span className="inline-flex rounded-full border border-accent/35 bg-accent/12 px-3 py-1 text-xs font-semibold tracking-wide text-foreground">
              {labels.aboutBadge}
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {labels.headline}
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted sm:text-base sm:leading-8">
              {profile.summary}
            </p>
            <div className="mt-5 rounded-2xl border border-border/60 bg-surface/75 p-3.5 sm:p-4">
              <p className="text-base font-semibold text-foreground">{profile.name}</p>
              <p className="mt-1 text-sm text-muted">{profile.title}</p>
            </div>

            <h2 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
              {labels.techStack}
            </h2>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {techItems.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  style={{ transitionDelay: isExpanded ? `${260 + index * 70}ms` : "0ms" }}
                  className={cn(
                    "rounded-xl border border-border bg-surface/85 p-2.5 transition-all duration-500",
                    isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/90">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.logoUrl}
                        alt={`${item.name} logo`}
                        className="h-5 w-5 object-contain"
                        loading="lazy"
                      />
                    </span>
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        {/* 프로필 카드는 초기 중앙 배치, 클릭 후 천천히 우측으로 이동한다. */}
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            "cursor-pointer group z-20 aspect-square w-52 overflow-hidden rounded-full bg-surface/95 p-1.5 shadow-2xl transition-all duration-1000 ease-out sm:w-60 lg:w-72",
            profileButtonPosition.base,
            isExpanded ? cn(profileButtonPosition.expanded, "scale-110 lg:scale-100") : "scale-100",
          )}
        >
          <div className="hover:animate-pulse relative h-full w-full overflow-hidden rounded-full border border-border/45 bg-background/75">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.aboutPhotoUrl}
              alt={`${profile.name} profile`}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/28 via-transparent to-transparent" />
          </div>
        </button>
      </div>
    </section>
  );
}
