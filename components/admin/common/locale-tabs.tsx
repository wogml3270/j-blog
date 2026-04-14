"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type AdminLocale = "ko" | "en" | "ja";

const LOCALE_LABELS: Record<AdminLocale, string> = {
  ko: "KO",
  en: "EN",
  ja: "JA",
};

type AdminLocaleTabsProps = {
  value: AdminLocale;
  onChange: (locale: AdminLocale) => void;
  className?: string;
};

export function AdminLocaleTabs({ value, onChange, className }: AdminLocaleTabsProps) {
  return (
    <div className={cn("inline-flex rounded-md border border-border bg-surface p-0.5", className)}>
      {(["ko", "en", "ja"] as const).map((locale) => (
        <Button
          key={locale}
          type="button"
          size="sm"
          variant={value === locale ? "solid" : "ghost"}
          className="h-8 px-3"
          onClick={() => onChange(locale)}
        >
          {LOCALE_LABELS[locale]}
        </Button>
      ))}
    </div>
  );
}
