export const locales = ["ko", "en", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

export const localeInfo: Record<
  Locale,
  {
    label: string;
    htmlLang: string;
    hreflang: string;
    ogLocale: string;
  }
> = {
  ko: {
    label: "KO",
    htmlLang: "ko",
    hreflang: "ko-KR",
    ogLocale: "ko_KR",
  },
  en: {
    label: "EN",
    htmlLang: "en",
    hreflang: "en-US",
    ogLocale: "en_US",
  },
  ja: {
    label: "JA",
    htmlLang: "ja",
    hreflang: "ja-JP",
    ogLocale: "ja_JP",
  },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (maybeLocale && isLocale(maybeLocale)) {
    const nextPath = segments.slice(1).join("/");
    return nextPath ? `/${nextPath}` : "/";
  }

  return pathname || "/";
}

export function withLocaleRoutePath(locale: Locale, pathname = "/"): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function withLocalePath(locale: Locale, pathname = "/"): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (locale === defaultLocale) {
    return normalized;
  }

  return withLocaleRoutePath(locale, normalized);
}
