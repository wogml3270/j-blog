"use client";

import { useEffect } from "react";

const FALLBACK_HEADER_HEIGHT = 64;
const FALLBACK_FOOTER_HEIGHT = 96;

// 헤더/푸터 실측 높이를 CSS 변수로 동기화해 홈 히어로의 1화면 레이아웃을 보정한다.
export function SiteViewportSync() {
  useEffect(() => {
    const root = document.documentElement;
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");

    const update = () => {
      const headerHeight = header?.getBoundingClientRect().height ?? FALLBACK_HEADER_HEIGHT;
      const footerHeight = footer?.getBoundingClientRect().height ?? FALLBACK_FOOTER_HEIGHT;

      root.style.setProperty("--site-header-height", `${Math.round(headerHeight)}px`);
      root.style.setProperty("--site-footer-height", `${Math.round(footerHeight)}px`);
      root.style.setProperty(
        "--home-hero-height",
        `calc(100dvh - ${Math.round(headerHeight)}px - ${Math.round(footerHeight)}px)`,
      );
    };

    update();

    const observer = new ResizeObserver(() => update());

    if (header) {
      observer.observe(header);
    }

    if (footer) {
      observer.observe(footer);
    }

    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}
