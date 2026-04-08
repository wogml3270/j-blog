import type {
  AdminPost,
  AdminPostInput,
  BlogPostDetail,
  BlogPostSummary,
} from "@/types/blog";
import type { PaginatedResult } from "@/types/admin";
import type { PublishStatus } from "@/types/db";
import {
  getAllPosts as getFallbackPosts,
  getPostBySlug as getFallbackPostBySlug,
} from "@/lib/blog/registry";
import { extractTocFromMarkdown } from "@/lib/blog/markdown";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  buildPaginatedResult,
  DEFAULT_ADMIN_PAGE_SIZE,
} from "@/lib/utils/pagination";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  featured: boolean;
  body_markdown: string;
  use_markdown_editor: boolean | null;
  status: PublishStatus;
  published_at: string | null;
  updated_at: string;
  post_tag_map?: unknown;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const POST_SELECT_FIELDS =
  "id,slug,title,description,thumbnail,featured,body_markdown,use_markdown_editor,status,published_at,updated_at,post_tag_map(post_tags(name))";

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
    bodyMarkdown: row.body_markdown,
    useMarkdownEditor: Boolean(row.use_markdown_editor),
    tags: relationToTagNames(row.post_tag_map),
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

function normalizePublishedAt(status: PublishStatus, raw: string | null | undefined): string | null {
  if (status === "draft") {
    return null;
  }

  if (!raw) {
    return new Date().toISOString();
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
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
    .upsert(normalizedTags.map((name) => ({ name })), { onConflict: "name" })
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

  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("status", "published")
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
  const safeLimit = typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;

  if (!service) {
    const fallback = fallbackPostList();
    return safeLimit ? fallback.slice(0, safeLimit) : fallback;
  }

  let query = service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("status", "published")
    .eq("featured", true)
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
      updatedAt: fallback.meta.date,
    };
  }

  const { data, error } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
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
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as PostRow[]).map(rowToAdminPost);
}

export async function getAdminPostsPaginated(
  page = 1,
  pageSize = 10,
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

  const { data, error, count } = await service
    .from("posts")
    .select(POST_SELECT_FIELDS, { count: "exact" })
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

  const { data, error } = await service
    .from("posts")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      thumbnail: input.thumbnail?.trim() || null,
      featured: Boolean(input.featured),
      body_markdown: input.bodyMarkdown,
      use_markdown_editor: input.useMarkdownEditor,
      status: normalizedStatus,
      published_at: normalizePublishedAt(normalizedStatus, input.publishedAt),
      created_by: userId,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return {
      data: null,
      error: error?.message ?? "Failed to create post.",
    };
  }

  await syncPostTags(data.id, input.tags);

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

  const { error } = await service
    .from("posts")
    .update({
      slug: input.slug,
      title: input.title,
      description: input.description,
      thumbnail: input.thumbnail?.trim() || null,
      featured: Boolean(input.featured),
      body_markdown: input.bodyMarkdown,
      use_markdown_editor: input.useMarkdownEditor,
      status: normalizedStatus,
      published_at: normalizePublishedAt(normalizedStatus, input.publishedAt),
    })
    .eq("id", id);

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  await syncPostTags(id, input.tags);

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

  return {
    data: { id },
    error: null,
  };
}
