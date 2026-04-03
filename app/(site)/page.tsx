import type { Metadata } from "next";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { Hero } from "@/components/home/hero";
import { RecentPosts } from "@/components/home/recent-posts";
import { TechStack } from "@/components/home/tech-stack";
import { getRecentPosts } from "@/lib/blog/registry";
import { getFeaturedProjects } from "@/lib/projects/data";
import { HOME_INTRO, TECH_STACK } from "@/lib/site/profile";

export const metadata: Metadata = {
  title: "Home",
  description: "3년차 프론트엔드 개발자의 포트폴리오와 최신 기술 글",
};

export default function HomePage() {
  const featuredProjects = getFeaturedProjects(3);
  const recentPosts = getRecentPosts(3);

  return (
    <div className="space-y-14 sm:space-y-16">
      <Hero
        name={HOME_INTRO.name}
        title={HOME_INTRO.title}
        summary={HOME_INTRO.summary}
      />
      <TechStack items={TECH_STACK} />
      <FeaturedProjects projects={featuredProjects} />
      <RecentPosts posts={recentPosts} />
    </div>
  );
}
