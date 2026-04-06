import type { Metadata } from "next";
import {
  localeInfo,
  locales,
  type Locale,
  withLocalePath,
} from "@/lib/i18n/config";
import { SITE_CONFIG, getSiteCopy } from "@/lib/site/profile";

type PageMetadataArgs = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
};

export function buildAlternates(locale: Locale, pathname: string): NonNullable<Metadata["alternates"]> {
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
      title,
      description,
      url: alternates.canonical as string,
      siteName: site.siteName,
      locale: localeInfo[locale].ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
