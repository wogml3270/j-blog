import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, localeInfo, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildAlternates } from "@/lib/seo/metadata";
import { SHARE_CARD_CONFIG, SITE_CONFIG, getSiteCopy } from "@/lib/site/profile";

type LangLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const locale = lang as Locale;
  const site = getSiteCopy(locale);

  return {
    title: {
      default: site.title,
      template: `%s | ${site.siteName}`,
    },
    description: site.description,
    alternates: buildAlternates(locale, "/"),
    openGraph: {
      title: site.title,
      description: site.description,
      url: `${SITE_CONFIG.siteUrl}${localeInfo[locale].pathPrefix}`,
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
      title: site.title,
      description: site.description,
      images: [SHARE_CARD_CONFIG.imagePath],
    },
  };
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <div
      data-locale={lang}
      lang={localeInfo[lang].htmlLang}
      className="locale-root min-h-dvh font-sans"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
      >
        {dictionary.common.skipToContent}
      </a>
      {children}
    </div>
  );
}
