import type {
  AdminPost,
  AdminPostInput,
  BlogPostDetail,
  BlogPostSummary,
  BlogTranslationInput,
  BlogTranslationMap,
} from "@/types/blog";
import type { AdminListFilter, PaginatedResult } from "@/types/admin";
import type { PublishStatus } from "@/types/db";
import type { Locale } from "@/lib/i18n/config";
import { extractTocFromMarkdown } from "@/lib/blog/markdown";
import { removeHomeHighlightSource, syncHomeHighlightSource } from "@/lib/home/sync";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  buildPaginatedResult,
  DEFAULT_ADMIN_PAGE_SIZE,
} from "@/lib/utils/pagination";
import { toSlugConflictMessage } from "@/lib/utils/db-error";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  featured: boolean;
  sync_slug_with_title: boolean | null;
  body_markdown: string;
  use_markdown_editor: boolean | null;
  status: PublishStatus;
  published_at: string | null;
  scheduled_publish_at: string | null;
  updated_at: string;
  post_tag_map?: unknown;
};

type PostTranslationRow = {
  post_id: string;
  title: string | null;
  description: string | null;
  body_markdown: string | null;
  tags: unknown;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const POST_SELECT_FIELDS =
  "id,slug,title,description,thumbnail,featured,sync_slug_with_title,body_markdown,use_markdown_editor,status,published_at,scheduled_publish_at,updated_at,post_tag_map(post_tags(name))";
const BLOG_DEFAULT_THUMBNAIL = "/blog/default-thumbnail.svg";

export class BlogServiceUnavailableError extends Error {
  constructor(message = "Blog database is unavailable.") {
    super(message);
    this.name = "BlogServiceUnavailableError";
  }
}

// 블로그는 DB를 단일 소스로 사용하므로 연결 실패 시 즉시 장애 에러를 노출한다.
function requireBlogService() {
  const service = createSupabaseServiceClient();

  if (!service) {
    throw new BlogServiceUnavailableError("Supabase service client is not configured.");
  }

  return service;
}

function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

function relationToTagNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const names: string[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const maybePostTags = (item as { post_tags?: unknown }).post_tags;

    if (Array.isArray(maybePostTags)) {
      for (const relation of maybePostTags) {
        if (
          relation &&
          typeof relation === "object" &&
          typeof (relation as { name?: unknown }).name === "string"
        ) {
          names.push((relation as { name: string }).name);
        }
      }

      continue;
    }

    if (
      maybePostTags &&
      typeof maybePostTags === "object" &&
      typeof (maybePostTags as { name?: unknown }).name === "string"
    ) {
      names.push((maybePostTags as { name: string }).name);
    }
  }

  return normalizeTags(names);
}

// 번역 테이블의 tags(json/text[]) 값을 string[]로 안전하게 정규화한다.
function toTranslationTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return normalizeTags(value.map((item) => String(item)));
}

function toNormalizedText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function toBlogTranslationInput(row: PostTranslationRow): BlogTranslationInput {
  return {
    title: toNormalizedText(row.title),
    description: toNormalizedText(row.description),
    bodyMarkdown: row.body_markdown ?? "",
    tags: toTranslationTags(row.tags),
  };
}

// locale 번역이 있으면 제목/설명/태그를 우선 적용하고, 없으면 KO 원문을 유지한다.
function applySummaryTranslation(
  summary: BlogPostSummary,
  translation: PostTranslationRow | null | undefined,
): BlogPostSummary {
  if (!translation) {
    return summary;
  }

  const translatedTags = toTranslationTags(translation.tags);

  return {
    ...summary,
    title: toNormalizedText(translation.title) || summary.title,
    description: toNormalizedText(translation.description) || summary.description,
    tags: translatedTags.length > 0 ? translatedTags : summary.tags,
  };
}

function rowToSummary(row: PostRow): BlogPostSummary {
  const date = row.published_at ?? row.updated_at;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail || BLOG_DEFAULT_THUMBNAIL,
    featured: row.featured,
    date,
    tags: relationToTagNames(row.post_tag_map),
  };
}

function rowToAdminPost(row: PostRow, translations: BlogTranslationMap = {}): AdminPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail || BLOG_DEFAULT_THUMBNAIL,
    featured: row.featured,
    syncSlugWithTitle: Boolean(row.sync_slug_with_title),
    bodyMarkdown: row.body_markdown,
    useMarkdownEditor: Boolean(row.use_markdown_editor),
    tags: relationToTagNames(row.post_tag_map),
    status: row.status,
    publishedAt: row.published_at,
    scheduledPublishAt: row.scheduled_publish_at,
    updatedAt: row.updated_at,
    translations,
  };
}

function normalizeScheduledPublishAt(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) {
    return null;
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

// 게시일/예약발행 필드는 최초 공개 시점을 기준으로 일관되게 계산한다.
function resolvePublicationFields({
  status,
  scheduledRaw,
  existingPublishedAt,
}: {
  status: PublishStatus;
  scheduledRaw: string | null | undefined;
  existingPublishedAt: string | null;
}): { publishedAt: string | null; scheduledPublishAt: string | null } {
  if (status === "draft") {
    return {
      publishedAt: null,
      scheduledPublishAt: null,
    };
  }

  if (existingPublishedAt) {
    const parsedExisting = new Date(existingPublishedAt);

    if (!Number.isNaN(parsedExisting.getTime())) {
      const fixedPublishedAt = parsedExisting.toISOString();
      const isFuturePublish = parsedExisting.getTime() > Date.now();

      return {
        publishedAt: fixedPublishedAt,
        scheduledPublishAt: isFuturePublish ? fixedPublishedAt : null,
      };
    }
  }

  const scheduledPublishAt = normalizeScheduledPublishAt(scheduledRaw);

  if (scheduledPublishAt) {
    return {
      publishedAt: scheduledPublishAt,
      scheduledPublishAt,
    };
  }

  return {
    publishedAt: new Date().toISOString(),
    scheduledPublishAt: null,
  };
}

async function syncPostTags(postId: string, tags: string[]) {
  const service = createSupabaseServiceClient();

  if (!service) {
    return;
  }

  const normalizedTags = normalizeTags(tags);

  await service.from("post_tag_map").delete().eq("post_id", postId);

  if (normalizedTags.length === 0) {
    return;
  }

  const { data: tagRows, error: upsertError } = await service
    .from("post_tags")
    .upsert(
      normalizedTags.map((name) => ({ name })),
      { onConflict: "name" },
    )
    .select("id,name");

  if (upsertError || !tagRows) {
    return;
  }

  const uniqueTagIds = [...new Set(tagRows.map((row) => row.id).filter(Boolean))];

  if (uniqueTagIds.length === 0) {
    return;
  }

  await service
    .from("post_tag_map")
    .insert(uniqueTagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
}

async function getAdminPostById(id: string): Promise<AdminPost | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("id", id)
    .maybeSingle<PostRow>();

  if (error || !data) {
    return null;
  }

  const [{ data: enRow }, { data: jaRow }] = await Promise.all([
    service
      .from("posts_en")
      .select("post_id,title,description,body_markdown,tags")
      .eq("post_id", id)
      .maybeSingle<PostTranslationRow>(),
    service
      .from("posts_ja")
      .select("post_id,title,description,body_markdown,tags")
      .eq("post_id", id)
      .maybeSingle<PostTranslationRow>(),
  ]);

  const translations: BlogTranslationMap = {};

  if (enRow) {
    translations.en = toBlogTranslationInput(enRow);
  }

  if (jaRow) {
    translations.ja = toBlogTranslationInput(jaRow);
  }

  return rowToAdminPost(data, translations);
}

// 관리자 목록용 번역 맵은 post_id 기준으로 EN/JA를 묶어 반환한다.
async function getAdminPostTranslationMapByPostIds(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  postIds: string[],
): Promise<Map<string, BlogTranslationMap>> {
  if (postIds.length === 0) {
    return new Map();
  }

  const [{ data: enRows, error: enError }, { data: jaRows, error: jaError }] = await Promise.all([
    service
      .from("posts_en")
      .select("post_id,title,description,body_markdown,tags")
      .in("post_id", postIds),
    service
      .from("posts_ja")
      .select("post_id,title,description,body_markdown,tags")
      .in("post_id", postIds),
  ]);

  if (enError || jaError) {
    return new Map();
  }

  const map = new Map<string, BlogTranslationMap>();

  for (const row of (enRows ?? []) as PostTranslationRow[]) {
    const current = map.get(row.post_id) ?? {};
    current.en = toBlogTranslationInput(row);
    map.set(row.post_id, current);
  }

  for (const row of (jaRows ?? []) as PostTranslationRow[]) {
    const current = map.get(row.post_id) ?? {};
    current.ja = toBlogTranslationInput(row);
    map.set(row.post_id, current);
  }

  return map;
}

// 관리자 입력 번역은 EN/JA를 각각 posts_en/posts_ja에 upsert한다.
async function upsertPostTranslations(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  postId: string,
  translations: BlogTranslationMap | undefined,
) {
  if (!translations) {
    return;
  }

  const en = translations.en;
  const ja = translations.ja;

  if (en) {
    await service.from("posts_en").upsert(
      {
        post_id: postId,
        title: en.title.trim(),
        description: en.description.trim(),
        body_markdown: en.bodyMarkdown,
        tags: normalizeTags(en.tags),
      },
      { onConflict: "post_id" },
    );
  }

  if (ja) {
    await service.from("posts_ja").upsert(
      {
        post_id: postId,
        title: ja.title.trim(),
        description: ja.description.trim(),
        body_markdown: ja.bodyMarkdown,
        tags: normalizeTags(ja.tags),
      },
      { onConflict: "post_id" },
    );
  }
}

// 게시글 목록 번역은 locale에 맞는 posts_en/posts_ja만 조회한다.
async function getPostTranslationMap(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  postIds: string[],
  locale: Locale,
): Promise<Map<string, PostTranslationRow>> {
  if (locale === "ko" || postIds.length === 0) {
    return new Map();
  }

  const table = locale === "en" ? "posts_en" : "posts_ja";
  const { data, error } = await service
    .from(table)
    .select("post_id,title,description,body_markdown,tags")
    .in("post_id", postIds);

  if (error || !data) {
    return new Map();
  }

  return new Map((data as PostTranslationRow[]).map((row) => [row.post_id, row]));
}

export async function getAllPublishedPosts(locale: Locale = "ko"): Promise<BlogPostSummary[]> {
  const service = requireBlogService();

  const nowIso = new Date().toISOString();
  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("status", "published")
    .or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${nowIso}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    throw new BlogServiceUnavailableError(error?.message ?? "Failed to load published posts.");
  }

  const summaries = (data as PostRow[]).map(rowToSummary);
  const translationMap = await getPostTranslationMap(
    service,
    summaries.map((item) => item.id ?? "").filter(Boolean),
    locale,
  );

  return summaries.map((summary) =>
    applySummaryTranslation(summary, summary.id ? translationMap.get(summary.id) : null),
  );
}

export async function getRecentPublishedPosts(
  limit = 3,
  locale: Locale = "ko",
): Promise<BlogPostSummary[]> {
  const posts = await getAllPublishedPosts(locale);
  return posts.slice(0, limit);
}

export async function getFeaturedPublishedPosts(
  limit?: number,
  locale: Locale = "ko",
): Promise<BlogPostSummary[]> {
  const service = requireBlogService();
  const safeLimit =
    typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;

  let query = service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("status", "published")
    .eq("featured", true)
    .or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${new Date().toISOString()}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (safeLimit) {
    query = query.limit(safeLimit);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new BlogServiceUnavailableError(error?.message ?? "Failed to load featured posts.");
  }

  const featuredSummaries = (data as PostRow[]).map(rowToSummary);
  const translationMap = await getPostTranslationMap(
    service,
    featuredSummaries.map((item) => item.id ?? "").filter(Boolean),
    locale,
  );
  const featuredPosts = featuredSummaries.map((summary) =>
    applySummaryTranslation(summary, summary.id ? translationMap.get(summary.id) : null),
  );

  if (featuredPosts.length > 0) {
    return featuredPosts;
  }

  const allPublished = await getAllPublishedPosts(locale);
  return safeLimit ? allPublished.slice(0, safeLimit) : allPublished;
}

export async function getPublishedPostBySlug(
  slug: string,
  locale: Locale = "ko",
): Promise<BlogPostDetail | null> {
  const service = requireBlogService();

  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${new Date().toISOString()}`)
    .maybeSingle<PostRow>();

  if (error) {
    throw new BlogServiceUnavailableError(error.message);
  }

  if (!data) {
    return null;
  }

  const summary = rowToSummary(data);
  const translationMap = await getPostTranslationMap(service, [data.id], locale);
  const translation = translationMap.get(data.id);
  const localizedSummary = applySummaryTranslation(summary, translation);
  const bodyMarkdown = toNormalizedText(translation?.body_markdown) || data.body_markdown || "";

  return {
    ...localizedSummary,
    source: "supabase",
    bodyMarkdown,
    toc: extractTocFromMarkdown(bodyMarkdown),
    status: data.status,
    publishedAt: data.published_at,
    scheduledPublishAt: data.scheduled_publish_at,
    updatedAt: data.updated_at,
  };
}

export async function getPostSlugsForSitemap(): Promise<string[]> {
  const posts = await getAllPublishedPosts("ko");
  return posts.map((post) => post.slug);
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as PostRow[];
  const translationMap = await getAdminPostTranslationMapByPostIds(
    service,
    rows.map((row) => row.id),
  );

  return rows.map((row) => rowToAdminPost(row, translationMap.get(row.id) ?? {}));
}

export async function getAdminPostsPaginated(
  page = 1,
  pageSize = 10,
  filter: AdminListFilter = "all",
  statusScope: PublishStatus | null = null,
): Promise<PaginatedResult<AdminPost>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return buildPaginatedResult([], page, pageSize, 0);
  }

  const safePage = Math.max(1, Math.floor(page));
  const parsedPageSize = Math.floor(pageSize);
  const safePageSize = ADMIN_PAGE_SIZE_OPTIONS.includes(parsedPageSize as 3 | 5 | 10)
    ? parsedPageSize
    : DEFAULT_ADMIN_PAGE_SIZE;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = service.from("posts").select(POST_SELECT_FIELDS, { count: "exact" });

  if (statusScope) {
    query = query.eq("status", statusScope);
  }

  if (filter === "main") {
    query = query.eq("featured", true);
  } else if (filter === "general") {
    query = query.eq("featured", false);
  } else if (filter === "published") {
    query = query.eq("status", "published");
  } else if (filter === "draft") {
    query = query.eq("status", "draft");
  }

  const { data, error, count } = await query
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return buildPaginatedResult([], safePage, safePageSize, 0);
  }

  const rows = data as PostRow[];
  const translationMap = await getAdminPostTranslationMapByPostIds(
    service,
    rows.map((row) => row.id),
  );

  return buildPaginatedResult(
    rows.map((row) => rowToAdminPost(row, translationMap.get(row.id) ?? {})),
    safePage,
    safePageSize,
    count ?? 0,
  );
}

export async function createAdminPost(
  input: AdminPostInput,
  userId: string,
): Promise<RepoResult<AdminPost>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const normalizedStatus: PublishStatus = input.status === "published" ? "published" : "draft";
  const publication = resolvePublicationFields({
    status: normalizedStatus,
    scheduledRaw: input.scheduledPublishAt,
    existingPublishedAt: null,
  });

  const { data, error } = await service
    .from("posts")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      thumbnail: input.thumbnail?.trim() || BLOG_DEFAULT_THUMBNAIL,
      featured: Boolean(input.featured),
      sync_slug_with_title: Boolean(input.syncSlugWithTitle),
      body_markdown: input.bodyMarkdown,
      use_markdown_editor: input.useMarkdownEditor,
      status: normalizedStatus,
      published_at: publication.publishedAt,
      scheduled_publish_at: publication.scheduledPublishAt,
      created_by: userId,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return {
      data: null,
      error: toSlugConflictMessage(error, "블로그") ?? error?.message ?? "Failed to create post.",
    };
  }

  await syncPostTags(data.id, input.tags);
  await upsertPostTranslations(service, data.id, input.translations);
  await syncHomeHighlightSource({
    sourceType: "post",
    sourceId: data.id,
    featured: Boolean(input.featured),
    status: normalizedStatus,
  });

  return {
    data: await getAdminPostById(data.id),
    error: null,
  };
}

export async function updateAdminPost(
  id: string,
  input: AdminPostInput,
): Promise<RepoResult<AdminPost>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const normalizedStatus: PublishStatus = input.status === "published" ? "published" : "draft";
  const { data: current } = await service
    .from("posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle<{ published_at: string | null }>();
  const publication = resolvePublicationFields({
    status: normalizedStatus,
    scheduledRaw: input.scheduledPublishAt,
    existingPublishedAt: current?.published_at ?? null,
  });

  const { error } = await service
    .from("posts")
    .update({
      slug: input.slug,
      title: input.title,
      description: input.description,
      thumbnail: input.thumbnail?.trim() || BLOG_DEFAULT_THUMBNAIL,
      featured: Boolean(input.featured),
      sync_slug_with_title: Boolean(input.syncSlugWithTitle),
      body_markdown: input.bodyMarkdown,
      use_markdown_editor: input.useMarkdownEditor,
      status: normalizedStatus,
      published_at: publication.publishedAt,
      scheduled_publish_at: publication.scheduledPublishAt,
    })
    .eq("id", id);

  if (error) {
    return {
      data: null,
      error: toSlugConflictMessage(error, "블로그") ?? error.message,
    };
  }

  await syncPostTags(id, input.tags);
  await upsertPostTranslations(service, id, input.translations);
  await syncHomeHighlightSource({
    sourceType: "post",
    sourceId: id,
    featured: Boolean(input.featured),
    status: normalizedStatus,
  });

  return {
    data: await getAdminPostById(id),
    error: null,
  };
}

export async function deleteAdminPost(id: string): Promise<RepoResult<{ id: string }>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { error } = await service.from("posts").delete().eq("id", id);

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  await removeHomeHighlightSource("post", id);

  return {
    data: { id },
    error: null,
  };
}
