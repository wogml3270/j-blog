"use client";

import { useTheme } from "@/components/theme/provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ThemeToggleLabels {
  loadingLabel: string;
  toLightLabel: string;
  toDarkLabel: string;
};

interface ThemeToggleProps {
  labels: ThemeToggleLabels;
};


function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.4v2.2M12 19.4v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.2 14.8A8 8 0 1 1 9.2 4.8a7.5 7.5 0 0 0 10 10z" />
    </svg>
  );
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();

  if (!resolvedTheme) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        aria-label={labels.loadingLabel}
        className="w-10 px-0"
      >
        <Skeleton width={18} height={18} rounded="9999px" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? labels.toLightLabel : labels.toDarkLabel}
      aria-pressed={isDark}
      className="group relative w-10 overflow-hidden px-0"
    >
      <span className="relative block h-4.5 w-4.5">
        <SunIcon
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </Button>
  );
}