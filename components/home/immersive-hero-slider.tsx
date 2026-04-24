"use client";

import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { HomeHeroSliderProps } from "@/types/ui";

const HIGHLIGHT_BADGE = {
  ko: {
    project: "프로젝트",
    post: "블로그",
  },
  en: {
    project: "Project",
    post: "Blog",
  },
  ja: {
    project: "プロジェクト",
    post: "ブログ",
  },
} as const;

export function ImmersiveHeroSlider({
  slides,
  viewProjectsLabel,
  viewBlogLabel,
}: HomeHeroSliderProps) {
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [thumbSwiper, setThumbSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedThumbIndex, setFocusedThumbIndex] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const safeSlides = useMemo(() => slides.filter((item) => item.title.trim()), [slides]);
  const shouldAutoplay = safeSlides.length > 1;

  // 썸네일 선택 이벤트(클릭/포커스/스와이프)를 메인 슬라이드로 반영한다.
  const syncMainToIndex = useCallback(
    (index: number) => {
      const normalizedIndex = Math.max(0, Math.min(index, safeSlides.length - 1));
      setActiveIndex(normalizedIndex);

      if (!mainSwiper || mainSwiper.destroyed) {
        return;
      }

      if (mainSwiper.realIndex === normalizedIndex) {
        return;
      }

      mainSwiper.slideTo(normalizedIndex);
    },
    [mainSwiper, safeSlides.length],
  );

  // 메인 슬라이드 인덱스가 바뀌면 썸네일 트랙도 해당 카드가 보이도록 이동시킨다.
  useEffect(() => {
    if (!thumbSwiper || thumbSwiper.destroyed) {
      return;
    }

    thumbSwiper.slideTo(activeIndex);
  }, [activeIndex, thumbSwiper]);

  // 모바일 구간에서만 썸네일 스와이프 -> 메인 동기화를 허용한다.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobileViewport(media.matches);

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  if (safeSlides.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="메인 홈 슬라이드"
      className="relative left-1/2 right-1/2 -mx-[50vw] -mb-8 -mt-8 w-screen overflow-hidden sm:-mb-10 sm:-mt-10 lg:-mb-12 lg:-mt-12"
    >
      <div
        className="relative bg-background"
        style={{
          minHeight: "var(--home-hero-height, calc(100dvh - 64px - 96px))",
          height: "var(--home-hero-height, calc(100dvh - 64px - 96px))",
        }}
      >
        <Swiper
          modules={[EffectFade, Keyboard, A11y, Autoplay]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1200}
          keyboard={{ enabled: true }}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          rewind={shouldAutoplay}
          observer
          observeParents
          autoplay={
            shouldAutoplay
              ? {
                  delay: 7000,
                  disableOnInteraction: false,
                  // 메인 히어로는 마우스가 기본적으로 올라가 있는 경우가 많아 자동재생을 멈추지 않게 한다.
                  pauseOnMouseEnter: false,
                  // fade + 커스텀 시각 효과 조합에서도 autoplay 타이머가 끊기지 않도록 한다.
                  waitForTransition: false,
                  stopOnLastSlide: false,
                }
              : false
          }
          className="home-immersive-main h-full"
        >
          {safeSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <article className="relative h-full w-full">
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="home-hero-bg-image h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="home-hero-bg-reveal absolute inset-0" />
                  <div className="absolute inset-0 bg-linear-to-r from-black/72 via-black/44 to-black/20" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/16" />
                </div>

                <div className="relative z-10 mx-auto flex h-full w-full max-w-[1240px] items-start px-5 pb-28 pt-14 sm:px-8 sm:pb-32 sm:pt-16 lg:items-center lg:pb-24 lg:pt-20">
                  <div className="home-hero-copy max-w-[min(74ch,86vw)] space-y-3 text-white sm:space-y-4">
                    <p
                      style={{ "--copy-delay": "120ms" } as CSSProperties}
                      className="home-hero-badge inline-flex rounded-full border border-white/35 bg-black/30 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80"
                    >
                      {HIGHLIGHT_BADGE[slide.locale][slide.sourceType]}
                    </p>
                    <h1
                      style={{ "--copy-delay": "260ms" } as CSSProperties}
                      className="home-hero-title text-[clamp(1.45rem,6vw,1.95rem)] font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
                    >
                      {slide.title}
                    </h1>
                    <p
                      style={{ "--copy-delay": "400ms" } as CSSProperties}
                      className="text-[clamp(0.86rem,3.5vw,0.98rem)] leading-[1.66] text-white/85 sm:text-base sm:leading-8"
                    >
                      {slide.description}
                    </p>
                    <div style={{ "--copy-delay": "660ms" } as CSSProperties} className="pt-3">
                      <Link
                        href={slide.href}
                        className={buttonStyles({
                          className:
                            "h-10 rounded-full border border-white/30 bg-white/92 px-4 text-xs text-black hover:bg-white sm:h-11 sm:px-5 sm:text-sm",
                        })}
                      >
                        {slide.ctaLabel ??
                          (slide.sourceType === "project" ? viewProjectsLabel : viewBlogLabel)}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="pointer-events-auto mx-auto max-w-[1240px]">
            <Swiper
              onSwiper={setThumbSwiper}
              spaceBetween={10}
              slidesPerView={1.2}
              breakpoints={{
                640: { slidesPerView: 2.2 },
                1024: { slidesPerView: 3.2 },
                1280: { slidesPerView: 4.2 },
              }}
              className="home-immersive-thumbs"
              onActiveIndexChange={(swiper) => {
                // 데스크탑에서는 썸네일 스와이프 동기화를 비활성화하고 모바일에서만 반영한다.
                if (!isMobileViewport) {
                  return;
                }

                syncMainToIndex(swiper.realIndex);
              }}
            >
              {safeSlides.map((slide, index) => {
                const isActive = activeIndex === index || focusedThumbIndex === index;

                return (
                  <SwiperSlide key={`thumb-${slide.id}`}>
                    <button
                      type="button"
                      className={cn(
                        "home-hero-thumb-button group relative h-17 w-full cursor-pointer overflow-hidden rounded-xl border text-left transition-all duration-300",
                        isActive
                          ? "border-white/85 opacity-100"
                          : "border-white/45 opacity-80 hover:opacity-100",
                      )}
                      aria-label={`${slide.title} 슬라이드로 이동`}
                      aria-current={activeIndex === index ? "true" : undefined}
                      onClick={() => syncMainToIndex(index)}
                      onFocus={() => setFocusedThumbIndex(index)}
                      onBlur={() => setFocusedThumbIndex(null)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.imageUrl}
                        alt=""
                        className={cn(
                          "home-hero-thumb-image absolute inset-0 h-full w-full object-cover",
                          isActive ? "home-hero-thumb-image-active" : null,
                        )}
                      />
                      <span className="home-hero-thumb-glass absolute inset-0" />
                      <span className="absolute inset-0 bg-black/42 transition-colors duration-300 group-hover:bg-black/28" />
                      <span className="relative z-10 line-clamp-2 block px-3 py-2.5 text-xs font-medium text-white">
                        {slide.title}
                      </span>
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
