import type { Locale } from "@/lib/i18n/config";
import type { PublishStatus } from "@/types/db";
import type {
  HomeHighlight,
  HomeHighlightInput,
  HomeHighlightResolvedSlide,
  HomeHighlightSourceOption,
  HomeHighlightSourceType,
} from "@/types/home";
import { getFeaturedPublishedPosts } from "@/lib/blog/repository";
import { stripMarkdownToPlainText } from "@/lib/blog/markdown";
import { withLocalePath } from "@/lib/i18n/config";
import { getPublishedProfileContent } from "@/lib/profile/repository";
import { getFeaturedProjects } from "@/lib/projects/repository";
import { DEFAULT_ABOUT_PHOTO_URL } from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { encodeSlugSegment } from "@/lib/utils/slug";

type HomeHighlightRow = {
  id: string;
  source_type: HomeHighlightSourceType;
  source_id: string;
  order_index: number;
  is_active: boolean;
  override_title: string | null;
  override_description: string | null;
  override_image_url: string | null;
  override_cta_label: string | null;
  created_at: string;
  updated_at: string;
};

type HighlightPostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  status: PublishStatus;
  featured: boolean;
  updated_at: string;
};

type HighlightProjectRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  status: PublishStatus;
  featured: boolean;
  updated_at: string;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const HOME_HIGHLIGHT_SELECT_FIELDS =
  "id,source_type,source_id,order_index,is_active,override_title,override_description,override_image_url,override_cta_label,created_at,updated_at";

const FALLBACK_SLIDE_IMAGE = "/blog/default-thumbnail.svg";

function rowToHighlight(row: HomeHighlightRow): HomeHighlight {
  return {
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    orderIndex: row.order_index,
    isActive: row.is_active,
    overrideTitle: row.override_title,
    overrideDescription: row.override_description,
    overrideImageUrl: row.override_image_url,
    overrideCtaLabel: row.override_cta_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toSourceOptionFromPost(row: HighlightPostRow): HomeHighlightSourceOption {
  return {
    id: row.id,
    sourceType: "post",
    title: row.title,
    description: row.description,
    slug: row.slug,
    imageUrl: row.thumbnail,
    status: row.status,
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

function toSourceOptionFromProject(row: HighlightProjectRow): HomeHighlightSourceOption {
  return {
    id: row.id,
    sourceType: "project",
    title: row.title,
    description: stripMarkdownToPlainText(row.summary),
    slug: row.slug,
    imageUrl: row.thumbnail,
    status: row.status,
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

export async function getAdminHomeHighlightSources(): Promise<HomeHighlightSourceOption[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const [postsResult, projectsResult] = await Promise.all([
    service
      .from("posts")
      .select("id,slug,title,description,thumbnail,status,featured,updated_at")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false }),
    service
      .from("projects")
      .select("id,slug,title,summary,thumbnail,status,featured,updated_at")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false }),
  ]);

  const posts = postsResult.error ? [] : ((postsResult.data ?? []) as HighlightPostRow[]);
  const projects = projectsResult.error
    ? []
    : ((projectsResult.data ?? []) as HighlightProjectRow[]);

  return [...projects.map(toSourceOptionFromProject), ...posts.map(toSourceOptionFromPost)].sort(
    (a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    },
  );
}

export async function getAdminHomeHighlights(): Promise<HomeHighlight[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("home_highlights")
    .select(HOME_HIGHLIGHT_SELECT_FIELDS)
    .order("order_index", { ascending: true })
    .order("updated_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as HomeHighlightRow[]).map(rowToHighlight);
}

export async function replaceAdminHomeHighlights(
  input: HomeHighlightInput[],
): Promise<RepoResult<HomeHighlight[]>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const normalizedRows = input
    .filter(
      (item) =>
        (item.sourceType === "project" || item.sourceType === "post") && item.sourceId.trim(),
    )
    .map((item, index) => ({
      source_type: item.sourceType,
      source_id: item.sourceId.trim(),
      order_index: Number.isFinite(item.orderIndex)
        ? Math.max(0, Math.floor(item.orderIndex))
        : index,
      is_active: Boolean(item.isActive),
      override_title: normalizeText(item.overrideTitle),
      override_description: normalizeText(item.overrideDescription),
      override_image_url: normalizeText(item.overrideImageUrl),
      override_cta_label: normalizeText(item.overrideCtaLabel),
    }))
    .sort((a, b) => a.order_index - b.order_index)
    .map((item, index) => ({
      ...item,
      order_index: index,
    }));

  const deleteResult = await service.from("home_highlights").delete().gte("order_index", 0);

  if (deleteResult.error) {
    return {
      data: null,
      error: deleteResult.error.message,
    };
  }

  if (normalizedRows.length > 0) {
    const insertResult = await service.from("home_highlights").insert(normalizedRows);

    if (insertResult.error) {
      return {
        data: null,
        error: insertResult.error.message,
      };
    }
  }

  return {
    data: await getAdminHomeHighlights(),
    error: null,
  };
}

async function getFallbackSlides(locale: Locale): Promise<HomeHighlightResolvedSlide[]> {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(locale),
    getFeaturedPublishedPosts(),
  ]);

  // 하이라이트가 비어있을 때는 "공개 + 메인 노출" 데이터만 기본 슬라이드로 사용한다.
  const featuredProjects = projects.filter(
    (project) => project.featured && (project.status === undefined || project.status === "published"),
  );
  const featuredPosts = posts.filter((post) => post.featured);

  const projectSlides: HomeHighlightResolvedSlide[] = featuredProjects.map((project, index) => ({
    id: `fallback-project-${project.slug}`,
    sourceType: "project",
    sourceId: project.id ?? project.slug,
    orderIndex: index,
    title: project.title,
    description: stripMarkdownToPlainText(project.summary),
    imageUrl: project.thumbnail || FALLBACK_SLIDE_IMAGE,
    href: withLocalePath(locale, `/projects/${encodeSlugSegment(project.slug)}`),
    ctaLabel: null,
    locale,
  }));

  const postSlides: HomeHighlightResolvedSlide[] = featuredPosts.map((post, index) => ({
    id: `fallback-post-${post.slug}`,
    sourceType: "post",
    sourceId: post.id ?? post.slug,
    orderIndex: projectSlides.length + index,
    title: post.title,
    description: post.description,
    imageUrl: post.thumbnail || FALLBACK_SLIDE_IMAGE,
    href: withLocalePath(locale, `/blog/${encodeSlugSegment(post.slug)}`),
    ctaLabel: null,
    locale,
  }));

  const combined = [...projectSlides, ...postSlides];

  if (combined.length > 0) {
    return combined;
  }

  const profile = await getPublishedProfileContent(locale);

  return [
    {
      id: "fallback-profile",
      sourceType: "project",
      sourceId: "fallback-profile",
      orderIndex: 0,
      title: profile.name,
      description: profile.summary,
      imageUrl: profile.aboutPhotoUrl || DEFAULT_ABOUT_PHOTO_URL,
      href: withLocalePath(locale, "/about"),
      ctaLabel: null,
      locale,
    },
  ];
}

export async function getHomeHighlightSlides(
  locale: Locale,
): Promise<HomeHighlightResolvedSlide[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return getFallbackSlides(locale);
  }

  const { data: rows, error } = await service
    .from("home_highlights")
    .select(HOME_HIGHLIGHT_SELECT_FIELDS)
    .eq("is_active", true)
    .order("order_index", { ascending: true })
    .order("updated_at", { ascending: true });

  if (error || !rows || rows.length === 0) {
    return getFallbackSlides(locale);
  }

  const highlights = (rows as HomeHighlightRow[]).map(rowToHighlight);
  const postIds = highlights
    .filter((item) => item.sourceType === "post")
    .map((item) => item.sourceId);
  const projectIds = highlights
    .filter((item) => item.sourceType === "project")
    .map((item) => item.sourceId);

  const [postRowsResult, projectRowsResult] = await Promise.all([
    postIds.length > 0
      ? service
          .from("posts")
          .select("id,slug,title,description,thumbnail,status,featured,updated_at")
          .eq("status", "published")
          .in("id", postIds)
      : Promise.resolve({ data: [] as HighlightPostRow[], error: null }),
    projectIds.length > 0
      ? service
          .from("projects")
          .select("id,slug,title,summary,thumbnail,status,featured,updated_at")
          .eq("status", "published")
          .in("id", projectIds)
      : Promise.resolve({ data: [] as HighlightProjectRow[], error: null }),
  ]);

  const postMap = new Map<string, HighlightPostRow>(
    (postRowsResult.error ? [] : ((postRowsResult.data ?? []) as HighlightPostRow[])).map(
      (item) => [item.id, item],
    ),
  );
  const projectMap = new Map<string, HighlightProjectRow>(
    (projectRowsResult.error ? [] : ((projectRowsResult.data ?? []) as HighlightProjectRow[])).map(
      (item) => [item.id, item],
    ),
  );

  const slides: HomeHighlightResolvedSlide[] = [];

  for (const item of highlights) {
    if (item.sourceType === "post") {
      const source = postMap.get(item.sourceId);

      if (!source) {
        continue;
      }

      slides.push({
        id: item.id,
        sourceType: "post",
        sourceId: item.sourceId,
        orderIndex: item.orderIndex,
        title: item.overrideTitle?.trim() || source.title,
        description: item.overrideDescription?.trim() || source.description,
        imageUrl: item.overrideImageUrl?.trim() || source.thumbnail || FALLBACK_SLIDE_IMAGE,
        href: withLocalePath(locale, `/blog/${encodeSlugSegment(source.slug)}`),
        ctaLabel: item.overrideCtaLabel?.trim() || null,
        locale,
      });
      continue;
    }

    const source = projectMap.get(item.sourceId);

    if (!source) {
      continue;
    }

    slides.push({
      id: item.id,
      sourceType: "project",
      sourceId: item.sourceId,
      orderIndex: item.orderIndex,
      title: item.overrideTitle?.trim() || source.title,
      description: item.overrideDescription?.trim() || stripMarkdownToPlainText(source.summary),
      imageUrl: item.overrideImageUrl?.trim() || source.thumbnail || FALLBACK_SLIDE_IMAGE,
      href: withLocalePath(locale, `/projects/${encodeSlugSegment(source.slug)}`),
      ctaLabel: item.overrideCtaLabel?.trim() || null,
      locale,
    });
  }

  if (slides.length === 0) {
    return getFallbackSlides(locale);
  }

  return slides.sort((a, b) => a.orderIndex - b.orderIndex);
}
