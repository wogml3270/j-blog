import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveAboutReveal } from "@/components/about/interactive-about-reveal";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getPublishedProfileContent } from "@/lib/profile/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";

type AboutPageProps = {
  params: Promise<{ lang: string }>;
};

function copyLabels(lang: "ko" | "en" | "ja") {
  if (lang === "en") {
    return {
      aboutBadge: "About",
      headline: "About",
      techStack: "Tech Stack",
    };
  }

  if (lang === "ja") {
    return {
      aboutBadge: "About",
      headline: "紹介",
      techStack: "技術スタック",
    };
  }
  return {
    aboutBadge: "About",
    headline: "소개",
    techStack: "기술 스택",
  };
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return buildPageMetadata({
    locale: lang,
    pathname: "/about",
    title: dictionary.about.title,
    description: dictionary.about.description,
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const profile = await getPublishedProfileContent(lang);
  const labels = copyLabels(lang);

  return <InteractiveAboutReveal profile={profile} labels={labels} />;
}
