import type { AdminPost, AdminPostInput, BlogPostDetail, BlogPostSummary } from "@/types/blog";
import type { AdminListFilter, PaginatedResult } from "@/types/admin";
import type { PublishStatus } from "@/types/db";
import {
  getAllPosts as getFallbackPosts,
  getPostBySlug as getFallbackPostBySlug,
} from "@/lib/blog/registry";
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

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const POST_SELECT_FIELDS =
  "id,slug,title,description,thumbnail,featured,sync_slug_with_title,body_markdown,use_markdown_editor,status,published_at,scheduled_publish_at,updated_at,post_tag_map(post_tags(name))";

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

function rowToSummary(row: PostRow): BlogPostSummary {
  const date = row.published_at ?? row.updated_at;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    featured: row.featured,
    date,
    tags: relationToTagNames(row.post_tag_map),
  };
}

function rowToAdminPost(row: PostRow): AdminPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    featured: row.featured,
    syncSlugWithTitle: Boolean(row.sync_slug_with_title),
    bodyMarkdown: row.body_markdown,
    useMarkdownEditor: Boolean(row.use_markdown_editor),
    tags: relationToTagNames(row.post_tag_map),
    status: row.status,
    publishedAt: row.published_at,
    scheduledPublishAt: row.scheduled_publish_at,
    updatedAt: row.updated_at,
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

  return rowToAdminPost(data);
}

function fallbackPostList(): BlogPostSummary[] {
  return getFallbackPosts().map((item) => ({
    slug: item.meta.slug,
    title: item.meta.title,
    description: item.meta.description,
    date: item.meta.date,
    featured: true,
    tags: item.meta.tags,
  }));
}

export async function getAllPublishedPosts(): Promise<BlogPostSummary[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackPostList();
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("status", "published")
    .or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${nowIso}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return fallbackPostList();
  }

  return (data as PostRow[]).map(rowToSummary);
}

export async function getRecentPublishedPosts(limit = 3): Promise<BlogPostSummary[]> {
  const posts = await getAllPublishedPosts();
  return posts.slice(0, limit);
}

export async function getFeaturedPublishedPosts(limit?: number): Promise<BlogPostSummary[]> {
  const service = createSupabaseServiceClient();
  const safeLimit =
    typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;

  if (!service) {
    const fallback = fallbackPostList();
    return safeLimit ? fallback.slice(0, safeLimit) : fallback;
  }

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
    const fallback = fallbackPostList();
    return safeLimit ? fallback.slice(0, safeLimit) : fallback;
  }

  const featuredPosts = (data as PostRow[]).map(rowToSummary);

  if (featuredPosts.length > 0) {
    return featuredPosts;
  }

  const allPublished = await getAllPublishedPosts();
  return safeLimit ? allPublished.slice(0, safeLimit) : allPublished;
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    const fallback = getFallbackPostBySlug(slug);

    if (!fallback) {
      return null;
    }

    return {
      source: "mdx",
      slug: fallback.meta.slug,
      title: fallback.meta.title,
      description: fallback.meta.description,
      thumbnail: null,
      date: fallback.meta.date,
      tags: fallback.meta.tags,
      toc: fallback.meta.toc,
      Component: fallback.Component,
      status: "published",
      publishedAt: fallback.meta.date,
      scheduledPublishAt: null,
      updatedAt: fallback.meta.date,
    };
  }

  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${new Date().toISOString()}`)
    .maybeSingle<PostRow>();

  if (error || !data) {
    const fallback = getFallbackPostBySlug(slug);

    if (!fallback) {
      return null;
    }

    return {
      source: "mdx",
      slug: fallback.meta.slug,
      title: fallback.meta.title,
      description: fallback.meta.description,
      thumbnail: null,
      date: fallback.meta.date,
      tags: fallback.meta.tags,
      toc: fallback.meta.toc,
      Component: fallback.Component,
      status: "published",
      publishedAt: fallback.meta.date,
      scheduledPublishAt: null,
      updatedAt: fallback.meta.date,
    };
  }

  const summary = rowToSummary(data);
  const bodyMarkdown = data.body_markdown || "";

  return {
    ...summary,
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
  const posts = await getAllPublishedPosts();
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

  return (data as PostRow[]).map(rowToAdminPost);
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

  return buildPaginatedResult(
    (data as PostRow[]).map(rowToAdminPost),
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
      thumbnail: input.thumbnail?.trim() || null,
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
      error:
        toSlugConflictMessage(error, "블로그") ?? error?.message ?? "Failed to create post.",
    };
  }

  await syncPostTags(data.id, input.tags);
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
      thumbnail: input.thumbnail?.trim() || null,
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
