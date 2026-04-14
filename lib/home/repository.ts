import type { Locale } from "@/lib/i18n/config";
import type { PublishStatus } from "@/types/db";
import type {
  HomeSlide,
  HomeSlideInput,
  HomeSlideResolved,
  HomeSlideSourceOption,
  HomeSlideSourceType,
} from "@/types/home-slide";
import { getFeaturedPublishedPosts } from "@/lib/blog/repository";
import { stripMarkdownToPlainText } from "@/lib/blog/markdown";
import { withLocalePath } from "@/lib/i18n/config";
import { getPublishedAboutContent } from "@/lib/profile/repository";
import { getFeaturedProjects } from "@/lib/projects/repository";
import { DEFAULT_ABOUT_PHOTO_URL } from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { encodeSlugSegment } from "@/lib/utils/slug";

type HomeSlideRow = {
  id: string;
  source_type: HomeSlideSourceType;
  source_id: string;
  order_index: number;
  is_active: boolean;
  override_cta_label: string | null;
  created_at: string;
  updated_at: string;
};

type HomeSlidePostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  status: PublishStatus;
  featured: boolean;
  updated_at: string;
};

type HomeSlideProjectRow = {
  id: string;
  slug: string;
  title: string;
  home_summary: string | null;
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

const HOME_SLIDE_SELECT_FIELDS =
  "id,source_type,source_id,order_index,is_active,override_cta_label,created_at,updated_at";

const FALLBACK_SLIDE_IMAGE = "/blog/default-thumbnail.svg";
const MAX_HERO_DESCRIPTION_LENGTH = 170;

function toHeroDescription(value: string | null | undefined): string {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= MAX_HERO_DESCRIPTION_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_HERO_DESCRIPTION_LENGTH).trimEnd()}...`;
}

function rowToHomeSlide(row: HomeSlideRow): HomeSlide {
  return {
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    orderIndex: row.order_index,
    isActive: row.is_active,
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

function toSourceOptionFromPost(row: HomeSlidePostRow): HomeSlideSourceOption {
  return {
    id: row.id,
    sourceType: "post",
    title: row.title,
    description: toHeroDescription(row.description),
    slug: row.slug,
    imageUrl: row.thumbnail,
    status: row.status,
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

function toSourceOptionFromProject(row: HomeSlideProjectRow): HomeSlideSourceOption {
  return {
    id: row.id,
    sourceType: "project",
    title: row.title,
    description: toHeroDescription(row.home_summary?.trim() || stripMarkdownToPlainText(row.summary)),
    slug: row.slug,
    imageUrl: row.thumbnail,
    status: row.status,
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

// 관리자 홈 슬라이드 후보(공개 프로젝트/게시글) 목록을 가져온다.
export async function getAdminHomeSlideSources(): Promise<HomeSlideSourceOption[]> {
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
      .select("id,slug,title,home_summary,summary,thumbnail,status,featured,updated_at")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false }),
  ]);

  const posts = postsResult.error ? [] : ((postsResult.data ?? []) as HomeSlidePostRow[]);
  const projects = projectsResult.error
    ? []
    : ((projectsResult.data ?? []) as HomeSlideProjectRow[]);

  return [...projects.map(toSourceOptionFromProject), ...posts.map(toSourceOptionFromPost)].sort(
    (a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    },
  );
}

// 관리자 홈 슬라이드 편집 목록을 정렬 순서대로 조회한다.
export async function getAdminHomeSlides(): Promise<HomeSlide[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("home_slide")
    .select(HOME_SLIDE_SELECT_FIELDS)
    .order("order_index", { ascending: true })
    .order("updated_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as HomeSlideRow[]).map(rowToHomeSlide);
}

// 관리자 저장 결과를 기준으로 home_slide 테이블을 스냅샷 교체한다.
export async function replaceAdminHomeSlides(
  input: HomeSlideInput[],
): Promise<RepoResult<HomeSlide[]>> {
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
      override_cta_label: normalizeText(item.overrideCtaLabel),
    }))
    .sort((a, b) => a.order_index - b.order_index)
    .map((item, index) => ({
      ...item,
      order_index: index,
    }));

  const deleteResult = await service.from("home_slide").delete().gte("order_index", 0);

  if (deleteResult.error) {
    return {
      data: null,
      error: deleteResult.error.message,
    };
  }

  if (normalizedRows.length > 0) {
    const insertResult = await service.from("home_slide").insert(normalizedRows);

    if (insertResult.error) {
      return {
        data: null,
        error: insertResult.error.message,
      };
    }
  }

  return {
    data: await getAdminHomeSlides(),
    error: null,
  };
}

async function getFallbackSlides(locale: Locale): Promise<HomeSlideResolved[]> {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(locale),
    getFeaturedPublishedPosts(undefined, locale),
  ]);

  // 하이라이트가 비어있을 때는 "공개 + 메인 노출" 데이터만 기본 슬라이드로 사용한다.
  const featuredProjects = projects.filter(
    (project) => project.featured && (project.status === undefined || project.status === "published"),
  );
  const featuredPosts = posts.filter((post) => post.featured);

  const projectSlides: HomeSlideResolved[] = featuredProjects.map((project, index) => ({
    id: `fallback-project-${project.slug}`,
    sourceType: "project",
    sourceId: project.id ?? project.slug,
    orderIndex: index,
    title: project.title,
    description: toHeroDescription(project.homeSummary || stripMarkdownToPlainText(project.summary)),
    imageUrl: project.thumbnail || FALLBACK_SLIDE_IMAGE,
    href: withLocalePath(locale, `/projects/${encodeSlugSegment(project.slug)}`),
    ctaLabel: null,
    locale,
  }));

  const postSlides: HomeSlideResolved[] = featuredPosts.map((post, index) => ({
    id: `fallback-post-${post.slug}`,
    sourceType: "post",
    sourceId: post.id ?? post.slug,
    orderIndex: projectSlides.length + index,
    title: post.title,
    description: toHeroDescription(post.description),
    imageUrl: post.thumbnail || FALLBACK_SLIDE_IMAGE,
    href: withLocalePath(locale, `/blog/${encodeSlugSegment(post.slug)}`),
    ctaLabel: null,
    locale,
  }));

  const combined = [...projectSlides, ...postSlides];

  if (combined.length > 0) {
    return combined;
  }

  const profile = await getPublishedAboutContent(locale);

  return [
    {
      id: "fallback-profile",
      sourceType: "project",
      sourceId: "fallback-profile",
      orderIndex: 0,
      title: profile.name,
      description: toHeroDescription(profile.summary),
      imageUrl: profile.aboutPhotoUrl || DEFAULT_ABOUT_PHOTO_URL,
      href: withLocalePath(locale, "/about"),
      ctaLabel: null,
      locale,
    },
  ];
}

// 공개 홈 슬라이드는 home_slide 우선, 비어 있으면 featured fallback을 사용한다.
export async function getHomeSlides(
  locale: Locale,
): Promise<HomeSlideResolved[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return getFallbackSlides(locale);
  }

  const { data: rows, error } = await service
    .from("home_slide")
    .select(HOME_SLIDE_SELECT_FIELDS)
    .eq("is_active", true)
    .order("order_index", { ascending: true })
    .order("updated_at", { ascending: true });

  if (error || !rows || rows.length === 0) {
    return getFallbackSlides(locale);
  }

  const highlights = (rows as HomeSlideRow[]).map(rowToHomeSlide);
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
      : Promise.resolve({ data: [] as HomeSlidePostRow[], error: null }),
    projectIds.length > 0
      ? service
          .from("projects")
          .select("id,slug,title,home_summary,summary,thumbnail,status,featured,updated_at")
          .eq("status", "published")
          .in("id", projectIds)
      : Promise.resolve({ data: [] as HomeSlideProjectRow[], error: null }),
  ]);

  const postMap = new Map<string, HomeSlidePostRow>(
    (postRowsResult.error ? [] : ((postRowsResult.data ?? []) as HomeSlidePostRow[])).map(
      (item) => [item.id, item],
    ),
  );
  const projectMap = new Map<string, HomeSlideProjectRow>(
    (projectRowsResult.error ? [] : ((projectRowsResult.data ?? []) as HomeSlideProjectRow[])).map(
      (item) => [item.id, item],
    ),
  );

  const slides: HomeSlideResolved[] = [];

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
        title: source.title,
        description: toHeroDescription(source.description),
        imageUrl: source.thumbnail || FALLBACK_SLIDE_IMAGE,
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
      title: source.title,
      description: toHeroDescription(source.home_summary?.trim() || stripMarkdownToPlainText(source.summary)),
      imageUrl: source.thumbnail || FALLBACK_SLIDE_IMAGE,
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

// v1 호출처 호환을 위해 기존 함수명을 alias로 유지한다.
export const getAdminHomeHighlightSources = getAdminHomeSlideSources;
export const getAdminHomeHighlights = getAdminHomeSlides;
export const replaceAdminHomeHighlights = replaceAdminHomeSlides;
export const getHomeHighlightSlides = getHomeSlides;
