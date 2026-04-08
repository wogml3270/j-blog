import type { BlogComment } from "@/types/blog";
import type { CommentStatus } from "@/types/db";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type CommentRow = Record<string, unknown>;

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

export type CreateCommentInput = {
  postSlug: string;
  authorUserId: string;
  authorEmail: string;
  authorNickname: string;
  authorAvatarUrl?: string | null;
  content: string;
  status?: CommentStatus;
};

function sanitizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeStatus(value: unknown): CommentStatus {
  if (value === "pending" || value === "rejected") {
    return value;
  }

  return "approved";
}

function rowToComment(row: CommentRow): BlogComment | null {
  const id = sanitizeText(row.id);
  const postId = sanitizeText(row.post_id);
  const authorUserId = sanitizeText(row.author_user_id);
  const content = sanitizeText(row.content);
  const createdAt = sanitizeText(row.created_at) || new Date().toISOString();

  if (!id || !postId || !authorUserId || !content) {
    return null;
  }

  const emailFromRow = sanitizeText(row.author_email);
  const nicknameFromRow = sanitizeText(row.author_nickname);

  return {
    id,
    postId,
    authorUserId,
    authorEmail: emailFromRow || "unknown@example.com",
    authorNickname: nicknameFromRow || "익명 사용자",
    authorAvatarUrl: sanitizeText(row.author_avatar_url) || null,
    content,
    status: normalizeStatus(row.status),
    createdAt,
  };
}

export async function getApprovedCommentsByPostSlug(slug: string): Promise<BlogComment[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data: post, error: postError } = await service
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<{ id: string }>();

  if (postError || !post) {
    return [];
  }

  const { data, error } = await service
    .from("comments")
    .select("*")
    .eq("post_id", post.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as CommentRow[])
    .map(rowToComment)
    .filter((item): item is BlogComment => Boolean(item));
}

function shouldFallbackLegacyColumns(errorMessage: string | undefined): boolean {
  const normalized = (errorMessage ?? "").toLowerCase();
  return (
    normalized.includes("author_email") ||
    normalized.includes("author_nickname") ||
    normalized.includes("author_avatar_url")
  );
}

export async function createCommentForPost(
  input: CreateCommentInput,
): Promise<RepoResult<BlogComment>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data: post, error: postError } = await service
    .from("posts")
    .select("id")
    .eq("slug", input.postSlug)
    .eq("status", "published")
    .maybeSingle<{ id: string }>();

  if (postError || !post) {
    return {
      data: null,
      error: "Post not found.",
    };
  }

  const status = input.status ?? "approved";
  const baseInsert = {
    post_id: post.id,
    author_user_id: input.authorUserId,
    content: input.content,
    status,
  };

  const fullInsert = {
    ...baseInsert,
    author_email: input.authorEmail,
    author_nickname: input.authorNickname,
    author_avatar_url: input.authorAvatarUrl ?? null,
  };

  let insertResult = await service.from("comments").insert(fullInsert).select("*").single<CommentRow>();

  if (insertResult.error && shouldFallbackLegacyColumns(insertResult.error.message)) {
    insertResult = await service.from("comments").insert(baseInsert).select("*").single<CommentRow>();
  }

  if (insertResult.error || !insertResult.data) {
    return {
      data: null,
      error: insertResult.error?.message ?? "Failed to create comment.",
    };
  }

  const mapped = rowToComment({
    ...insertResult.data,
    author_email: (insertResult.data.author_email ?? input.authorEmail) as unknown,
    author_nickname: (insertResult.data.author_nickname ?? input.authorNickname) as unknown,
    author_avatar_url: (insertResult.data.author_avatar_url ?? input.authorAvatarUrl ?? null) as unknown,
  });

  if (!mapped) {
    return {
      data: null,
      error: "Failed to normalize comment data.",
    };
  }

  return {
    data: mapped,
    error: null,
  };
}
