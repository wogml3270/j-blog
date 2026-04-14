"use client";

import { useEffect, useMemo, useState } from "react";
import { useDevice } from "@/lib/hooks/use-device";
import { cn } from "@/lib/utils/cn";
import type { InteractiveAboutRevealProps } from "@/types/ui";

export function InteractiveAboutReveal({ profile, labels }: InteractiveAboutRevealProps) {
  const { isMobile, isDesktop } = useDevice();
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 초기 진입 시 프로필 이미지를 먼저 작게 등장시키고, 딜레이 뒤 콘텐츠를 천천히 펼친다.
  useEffect(() => {
    const avatarTimer = window.setTimeout(
      () => {
        setIsAvatarVisible(true);
      },
      isMobile ? 80 : 120,
    );
    const expandTimer = window.setTimeout(
      () => {
        setIsExpanded(true);
      },
      isMobile ? 920 : 1180,
    );

    return () => {
      window.clearTimeout(avatarTimer);
      window.clearTimeout(expandTimer);
    };
  }, [isMobile]);

  // 모션 위치 조정
  const profileButtonPosition = {
    // 공통 기준점
    base: "left-1/2 -translate-x-1/2",
    // 접힘 상태: 모바일 상단, 데스크톱 중앙
    collapsed: isMobile ? "top-0 translate-y-0" : "top-1/2 -translate-y-1/2",
    // 펼침 상태: 모바일 상단 유지, 데스크톱 우측 이동
    expanded: isMobile ? "top-0 translate-y-0" : "left-4/5 top-1/2 -translate-y-1/2",
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
      <div
        className="relative min-h-[--home-hero-height] px-4 py-6 sm:px-6 sm:py-8"
        style={{ minHeight: "var(--home-hero-height)" }}
      >
        {/* 콘텐츠 모션은 래퍼에서만 처리해 레이아웃 점프를 줄인다. */}
        <div
          className={cn(
            "w-full overflow-hidden transform-gpu transition-[max-height,opacity,transform] duration-2400 ease-[cubic-bezier(0.22,1,0.36,1)] lg:max-w-[58%]",
            isExpanded
              ? "pointer-events-auto opacity-100 translate-y-0 lg:translate-x-0"
              : "pointer-events-none max-h-0 opacity-0 translate-y-4 lg:-translate-x-12",
          )}
        >
          <article className="w-full rounded-3xl border border-border/70 bg-background/70 p-4 pt-60 shadow-lg backdrop-blur-sm lg:pt-5">
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

        {/* 프로필 카드는 클릭 없이 자동 리빌되며, 데스크톱에서만 우측 이동한다. */}
        <div
          aria-hidden="true"
          className={cn(
            "group z-20 aspect-square w-52 overflow-hidden rounded-full bg-surface/95 p-1.5 shadow-2xl transform-gpu transition-[opacity,transform,left,top] duration-1800 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-60 lg:w-72 absolute",
            profileButtonPosition.base,
            profileButtonPosition.collapsed,
            isAvatarVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.62]",
            isExpanded
              ? cn(profileButtonPosition.expanded, isDesktop ? "scale-100" : "scale-110")
              : "",
          )}
        >
          <div
            className={cn(
              "hover:animate-pulse relative h-full w-full overflow-hidden rounded-full border border-border/45 bg-background/75",
              isExpanded
                ? isDesktop
                  ? "about-avatar-spin-desktop"
                  : "about-avatar-spin-mobile"
                : "",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.aboutPhotoUrl}
              alt={`${profile.name} profile`}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/28 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
