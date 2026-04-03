import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/registry";
import { getAllProjects } from "@/lib/projects/data";
import { SITE_CONFIG } from "@/lib/site/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/projects", "/blog"].map((path) => ({
    url: `${SITE_CONFIG.siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const projectRoutes = getAllProjects().map((project) => ({
    url: `${SITE_CONFIG.siteUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogRoutes = getAllPosts().map((post) => ({
    url: `${SITE_CONFIG.siteUrl}/blog/${post.meta.slug}`,
    lastModified: new Date(post.meta.date),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
