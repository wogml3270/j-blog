import type { MetadataRoute } from "next";
import { getAllPublishedPosts } from "@/lib/blog/repository";
import { localeInfo, locales, withLocalePath } from "@/lib/i18n/config";
import { getAllPublishedProjects } from "@/lib/projects/repository";
import { SITE_CONFIG } from "@/lib/site/profile";

function buildAlternateLanguages(pathname: string) {
  return Object.fromEntries(
    locales.map((lang) => [
      localeInfo[lang].hreflang,
      `${SITE_CONFIG.siteUrl}${withLocalePath(lang, pathname)}`,
    ]),
  );
}

function localizedEntries(
  pathname: string,
  options: {
    lastModified: Date;
    changeFrequency: "weekly" | "monthly";
    priority: number;
  },
): MetadataRoute.Sitemap {
  const alternates = buildAlternateLanguages(pathname);

  return locales.map((lang) => ({
    url: `${SITE_CONFIG.siteUrl}${withLocalePath(lang, pathname)}`,
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: {
      languages: alternates,
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/about", "/projects", "/blog"].flatMap((path) =>
    localizedEntries(path, {
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "/" ? 1 : 0.7,
    }),
  );

  const [projects, posts] = await Promise.all([
    getAllPublishedProjects("ko"),
    getAllPublishedPosts(),
  ]);

  const projectRoutes = projects.flatMap((project) =>
    localizedEntries(`/projects/${project.slug}`, {
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  const blogRoutes = posts.flatMap((post) =>
    localizedEntries(`/blog/${post.slug}`, {
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.75,
    }),
  );

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
