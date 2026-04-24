import type { Metadata } from "next";
import { localeInfo, locales, type Locale, withLocalePath } from "@/lib/i18n/config";
import { SHARE_CARD_CONFIG, SITE_CONFIG, getSiteCopy } from "@/lib/site/profile";

type ShareCardMode = "fixedShareCard" | "dynamicShareCard";

type PageMetadataArgs = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  shareCard?: {
    mode?: ShareCardMode;
    title?: string;
    description?: string;
    imagePath?: string | null;
  };
};

export function buildAlternates(
  locale: Locale,
  pathname: string,
): NonNullable<Metadata["alternates"]> {
  const canonical = `${SITE_CONFIG.siteUrl}${withLocalePath(locale, pathname)}`;

  const languages = Object.fromEntries(
    locales.map((item) => [
      localeInfo[item].hreflang,
      `${SITE_CONFIG.siteUrl}${withLocalePath(item, pathname)}`,
    ]),
  );

  return {
    canonical,
    languages,
  };
}

function toAbsoluteUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl?.trim()) {
    return `${SITE_CONFIG.siteUrl}${SHARE_CARD_CONFIG.imagePath}`;
  }

  const trimmed = pathOrUrl.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${SITE_CONFIG.siteUrl}${normalizedPath}`;
}

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  shareCard,
}: PageMetadataArgs): Metadata {
  const site = getSiteCopy(locale);
  const alternates = buildAlternates(locale, pathname);
  const mode = shareCard?.mode ?? "fixedShareCard";
  const isFixed = mode === "fixedShareCard";
  const cardTitle = isFixed ? SHARE_CARD_CONFIG.title : shareCard?.title?.trim() || title;
  const cardDescription = isFixed
    ? SHARE_CARD_CONFIG.description
    : shareCard?.description?.trim() || description;
  const cardImage = toAbsoluteUrl(shareCard?.imagePath ?? SHARE_CARD_CONFIG.imagePath);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title: cardTitle,
      description: cardDescription,
      url: alternates.canonical as string,
      siteName: site.siteName,
      locale: localeInfo[locale].ogLocale,
      type: "website",
      images: [
        {
          url: cardImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cardTitle,
      description: cardDescription,
      images: [cardImage],
    },
  };
}
