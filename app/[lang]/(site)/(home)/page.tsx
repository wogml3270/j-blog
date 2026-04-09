import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImmersiveHeroSlider } from "@/components/home/immersive-hero-slider";
import { getHomeHighlightSlides } from "@/lib/home/repository";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

type HomePageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return buildPageMetadata({
    locale: lang,
    pathname: "/",
    title: dictionary.home.title,
    description: dictionary.home.description,
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const slides = await getHomeHighlightSlides(lang);

  return (
    <div>
      <ImmersiveHeroSlider
        slides={slides}
        viewProjectsLabel={dictionary.home.viewProjects}
        viewBlogLabel={dictionary.home.viewBlog}
      />
    </div>
  );
}
