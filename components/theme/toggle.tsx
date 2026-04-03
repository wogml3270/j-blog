"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  if (!resolvedTheme) {
    return (
      <Button variant="outline" size="sm" disabled aria-label="테마 전환">
        테마
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="다크 모드 전환"
      aria-pressed={isDark}
    >
      {isDark ? "라이트" : "다크"}
    </Button>
  );
}
