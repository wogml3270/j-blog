"use client";

import { useEffect, useState } from "react";

// 뷰포트 기준으로 모바일/데스크톱 상태를 동기화하는 공통 훅
export function useDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      setIsMobile(mobileQuery.matches);
      setIsDesktop(desktopQuery.matches);
    };

    sync();

    mobileQuery.addEventListener("change", sync);
    desktopQuery.addEventListener("change", sync);

    return () => {
      mobileQuery.removeEventListener("change", sync);
      desktopQuery.removeEventListener("change", sync);
    };
  }, []);

  return { isMobile, isDesktop };
}

