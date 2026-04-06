import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { Hero } from "@/components/home/hero";
import { RecentPosts } from "@/components/home/recent-posts";
import { TechStack } from "@/components/home/tech-stack";
import { getRecentPublishedPosts } from "@/lib/blog/repository";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getPublishedProfileContent } from "@/lib/profile/repository";
import { getFeaturedProjects } from "@/lib/projects/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { TECH_STACK } from "@/lib/site/profile";

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
  const [profile, featuredProjects, recentPosts] = await Promise.all([
    getPublishedProfileContent(lang),
    getFeaturedProjects(lang, 3),
    getRecentPublishedPosts(3),
  ]);

  return (
    <div className="space-y-14 sm:space-y-16">
      <Hero
        locale={lang}
        name={profile.name}
        title={profile.title}
        summary={profile.summary}
        eyebrow={dictionary.home.heroEyebrow}
        viewProjectsLabel={dictionary.home.viewProjects}
        viewBlogLabel={dictionary.home.viewBlog}
      />
      <TechStack
        items={TECH_STACK}
        title={dictionary.home.techStackTitle}
        description={dictionary.home.techStackDescription}
      />
      <FeaturedProjects
        locale={lang}
        projects={featuredProjects}
        title={dictionary.home.featuredProjectsTitle}
        description={dictionary.home.featuredProjectsDescription}
        allProjectsLabel={dictionary.home.allProjects}
        detailLabel={dictionary.projects.detailLabel}
      />
      <RecentPosts
        locale={lang}
        posts={recentPosts}
        title={dictionary.home.recentPostsTitle}
        description={dictionary.home.recentPostsDescription}
        allPostsLabel={dictionary.home.allPosts}
      />
    </div>
  );
}
