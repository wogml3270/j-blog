import type { MetadataRoute } from "next";
import { localeInfo, locales, withLocalePath } from "@/lib/i18n/config";
import { SITE_CONFIG } from "@/lib/site/profile";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "@/lib/supabase/env";
import { encodeSlugSegment } from "@/lib/utils/slug";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

type SitemapProjectRow = {
  slug: string;
  updated_at: string | null;
};

type SitemapPostRow = {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
  scheduled_publish_at: string | null;
};

function createSitemapClient() {
  const env = getSupabasePublicEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!env || (!serviceRoleKey && !env.publishableKey)) {
    return null;
  }

  // sitemap은 정적 생성/재검증 경로를 쓰므로 no-store 클라이언트를 사용하지 않는다.
  return createClient(env.url, serviceRoleKey ?? env.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "force-cache",
          next: {
            ...(((init as RequestInit & { next?: Record<string, unknown> })?.next ??
              {}) as Record<string, unknown>),
            revalidate,
          },
        }),
    },
  });
}

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

  const client = createSitemapClient();

  if (!client) {
    return staticRoutes;
  }

  try {
    const nowIso = new Date().toISOString();
    const [{ data: projects, error: projectsError }, { data: posts, error: postsError }] =
      await Promise.all([
        client
          .from("projects")
          .select("slug,updated_at")
          .eq("status", "published")
          .order("updated_at", { ascending: false }),
        client
          .from("posts")
          .select("slug,published_at,updated_at,scheduled_publish_at")
          .eq("status", "published")
          .or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${nowIso}`)
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("updated_at", { ascending: false }),
      ]);

    if (projectsError || postsError) {
      return staticRoutes;
    }

    const projectRoutes = ((projects ?? []) as SitemapProjectRow[]).flatMap((project) =>
      localizedEntries(`/projects/${encodeSlugSegment(project.slug)}`, {
        lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    );

    const blogRoutes = ((posts ?? []) as SitemapPostRow[]).flatMap((post) => {
      const lastModifiedSource = post.published_at ?? post.updated_at ?? new Date().toISOString();

      return localizedEntries(`/blog/${encodeSlugSegment(post.slug)}`, {
        lastModified: new Date(lastModifiedSource),
        changeFrequency: "monthly",
        priority: 0.75,
      });
    });

    return [...staticRoutes, ...projectRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
