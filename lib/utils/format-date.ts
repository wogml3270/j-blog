import type { Locale } from "@/lib/i18n/config";

const localeMap: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
};

const formatters = new Map<Locale, Intl.DateTimeFormat>();

function getFormatter(locale: Locale): Intl.DateTimeFormat {
  const cached = formatters.get(locale);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  formatters.set(locale, formatter);
  return formatter;
}

export function formatDate(date: string, locale: Locale): string {
  return getFormatter(locale).format(new Date(date));
}
