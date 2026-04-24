import type { Metadata } from "next";
import { localeInfo, locales, type Locale, withLocalePath } from "@/lib/i18n/config";
import { SHARE_CARD_CONFIG, SITE_CONFIG, getSiteCopy } from "@/lib/site/profile";

type PageMetadataArgs = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
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

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
}: PageMetadataArgs): Metadata {
  const site = getSiteCopy(locale);
  const alternates = buildAlternates(locale, pathname);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title: SHARE_CARD_CONFIG.title,
      description: SHARE_CARD_CONFIG.description,
      url: alternates.canonical as string,
      siteName: site.siteName,
      locale: localeInfo[locale].ogLocale,
      type: "website",
      images: [
        {
          url: SHARE_CARD_CONFIG.imagePath,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SHARE_CARD_CONFIG.title,
      description: SHARE_CARD_CONFIG.description,
      images: [SHARE_CARD_CONFIG.imagePath],
    },
  };
}
