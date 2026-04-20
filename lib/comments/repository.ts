import type { BlogComment } from "@/types/blog";
import type { CommentStatus } from "@/types/db";
import type { ProjectComment } from "@/types/projects";
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

export type CreateProjectCommentInput = {
  projectSlug: string;
  authorUserId: string;
  authorEmail: string;
  authorNickname: string;
  authorAvatarUrl?: string | null;
  content: string;
  status?: CommentStatus;
};

export type UpdateCommentByAuthorInput = {
  commentId: string;
  authorUserId: string;
  content: string;
};

export type DeleteCommentByAuthorInput = {
  commentId: string;
  authorUserId: string;
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

function baseCommentFields(row: CommentRow) {
  const id = sanitizeText(row.id);
  const authorUserId = sanitizeText(row.author_user_id);
  const content = sanitizeText(row.content);
  const createdAt = sanitizeText(row.created_at) || new Date().toISOString();
  const updatedAt = sanitizeText(row.updated_at) || null;

  return {
    id,
    authorUserId,
    content,
    createdAt,
    updatedAt,
    authorEmail: sanitizeText(row.author_email) || "unknown@example.com",
    authorNickname: sanitizeText(row.author_nickname) || "익명 사용자",
    authorAvatarUrl: sanitizeText(row.author_avatar_url) || null,
    status: normalizeStatus(row.status),
  };
}

function rowToBlogComment(row: CommentRow): BlogComment | null {
  const postId = sanitizeText(row.post_id);
  const base = baseCommentFields(row);

  if (!base.id || !postId || !base.authorUserId || !base.content) {
    return null;
  }

  return {
    id: base.id,
    postId,
    authorUserId: base.authorUserId,
    authorEmail: base.authorEmail,
    authorNickname: base.authorNickname,
    authorAvatarUrl: base.authorAvatarUrl,
    content: base.content,
    status: base.status,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

function rowToProjectComment(row: CommentRow): ProjectComment | null {
  const projectId = sanitizeText(row.project_id);
  const base = baseCommentFields(row);

  if (!base.id || !projectId || !base.authorUserId || !base.content) {
    return null;
  }

  return {
    id: base.id,
    projectId,
    authorUserId: base.authorUserId,
    authorEmail: base.authorEmail,
    authorNickname: base.authorNickname,
    authorAvatarUrl: base.authorAvatarUrl,
    content: base.content,
    status: base.status,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

function shouldFallbackLegacyColumns(errorMessage: string | undefined): boolean {
  const normalized = (errorMessage ?? "").toLowerCase();
  return (
    normalized.includes("author_email") ||
    normalized.includes("author_nickname") ||
    normalized.includes("author_avatar_url")
  );
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
    .from("posts_comments")
    .select("*")
    .eq("post_id", post.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as CommentRow[])
    .map(rowToBlogComment)
    .filter((item): item is BlogComment => Boolean(item));
}

export async function getApprovedCommentsByProjectSlug(slug: string): Promise<ProjectComment[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data: project, error: projectError } = await service
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<{ id: string }>();

  if (projectError || !project) {
    return [];
  }

  const { data, error } = await service
    .from("projects_comments")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as CommentRow[])
    .map(rowToProjectComment)
    .filter((item): item is ProjectComment => Boolean(item));
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

  let insertResult = await service
    .from("posts_comments")
    .insert(fullInsert)
    .select("*")
    .single<CommentRow>();

  if (insertResult.error && shouldFallbackLegacyColumns(insertResult.error.message)) {
    insertResult = await service
      .from("posts_comments")
      .insert(baseInsert)
      .select("*")
      .single<CommentRow>();
  }

  if (insertResult.error || !insertResult.data) {
    return {
      data: null,
      error: insertResult.error?.message ?? "Failed to create comment.",
    };
  }

  const mapped = rowToBlogComment({
    ...insertResult.data,
    author_email: (insertResult.data.author_email ?? input.authorEmail) as unknown,
    author_nickname: (insertResult.data.author_nickname ?? input.authorNickname) as unknown,
    author_avatar_url: (insertResult.data.author_avatar_url ??
      input.authorAvatarUrl ??
      null) as unknown,
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

export async function createCommentForProject(
  input: CreateProjectCommentInput,
): Promise<RepoResult<ProjectComment>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data: project, error: projectError } = await service
    .from("projects")
    .select("id")
    .eq("slug", input.projectSlug)
    .eq("status", "published")
    .maybeSingle<{ id: string }>();

  if (projectError || !project) {
    return {
      data: null,
      error: "Project not found.",
    };
  }

  const status = input.status ?? "approved";
  const baseInsert = {
    project_id: project.id,
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

  let insertResult = await service
    .from("projects_comments")
    .insert(fullInsert)
    .select("*")
    .single<CommentRow>();

  if (insertResult.error && shouldFallbackLegacyColumns(insertResult.error.message)) {
    insertResult = await service
      .from("projects_comments")
      .insert(baseInsert)
      .select("*")
      .single<CommentRow>();
  }

  if (insertResult.error || !insertResult.data) {
    return {
      data: null,
      error: insertResult.error?.message ?? "Failed to create comment.",
    };
  }

  const mapped = rowToProjectComment({
    ...insertResult.data,
    author_email: (insertResult.data.author_email ?? input.authorEmail) as unknown,
    author_nickname: (insertResult.data.author_nickname ?? input.authorNickname) as unknown,
    author_avatar_url: (insertResult.data.author_avatar_url ??
      input.authorAvatarUrl ??
      null) as unknown,
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

export async function updateCommentByAuthor(
  input: UpdateCommentByAuthorInput,
): Promise<RepoResult<BlogComment>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("posts_comments")
    .update({
      content: input.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.commentId)
    .eq("author_user_id", input.authorUserId)
    .select("*")
    .maybeSingle<CommentRow>();

  if (error) {
    return {
      data: null,
      error: error.message || "Failed to update comment.",
    };
  }

  if (!data) {
    return {
      data: null,
      error: "Comment not found or unauthorized.",
    };
  }

  const mapped = rowToBlogComment(data);

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

export async function updateProjectCommentByAuthor(
  input: UpdateCommentByAuthorInput,
): Promise<RepoResult<ProjectComment>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("projects_comments")
    .update({
      content: input.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.commentId)
    .eq("author_user_id", input.authorUserId)
    .select("*")
    .maybeSingle<CommentRow>();

  if (error) {
    return {
      data: null,
      error: error.message || "Failed to update comment.",
    };
  }

  if (!data) {
    return {
      data: null,
      error: "Comment not found or unauthorized.",
    };
  }

  const mapped = rowToProjectComment(data);

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

export async function deleteCommentByAuthor(
  input: DeleteCommentByAuthorInput,
): Promise<RepoResult<{ id: string }>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("posts_comments")
    .delete()
    .eq("id", input.commentId)
    .eq("author_user_id", input.authorUserId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return {
      data: null,
      error: error.message || "Failed to delete comment.",
    };
  }

  if (!data?.id) {
    return {
      data: null,
      error: "Comment not found or unauthorized.",
    };
  }

  return {
    data: { id: data.id },
    error: null,
  };
}

export async function deleteProjectCommentByAuthor(
  input: DeleteCommentByAuthorInput,
): Promise<RepoResult<{ id: string }>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("projects_comments")
    .delete()
    .eq("id", input.commentId)
    .eq("author_user_id", input.authorUserId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return {
      data: null,
      error: error.message || "Failed to delete comment.",
    };
  }

  if (!data?.id) {
    return {
      data: null,
      error: "Comment not found or unauthorized.",
    };
  }

  return {
    data: { id: data.id },
    error: null,
  };
}

export async function getCommentsByPostIdForAdmin(postId: string): Promise<BlogComment[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("posts_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as CommentRow[])
    .map(rowToBlogComment)
    .filter((item): item is BlogComment => Boolean(item));
}

export async function getCommentsByProjectIdForAdmin(projectId: string): Promise<ProjectComment[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("projects_comments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as CommentRow[])
    .map(rowToProjectComment)
    .filter((item): item is ProjectComment => Boolean(item));
}

export async function deleteCommentByIdForAdmin(commentId: string): Promise<RepoResult<{ id: string }>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("posts_comments")
    .delete()
    .eq("id", commentId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return {
      data: null,
      error: error.message || "Failed to delete comment.",
    };
  }

  if (!data?.id) {
    return {
      data: null,
      error: "Comment not found.",
    };
  }

  return {
    data: { id: data.id },
    error: null,
  };
}

export async function deleteProjectCommentByIdForAdmin(
  commentId: string,
): Promise<RepoResult<{ id: string }>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("projects_comments")
    .delete()
    .eq("id", commentId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return {
      data: null,
      error: error.message || "Failed to delete comment.",
    };
  }

  if (!data?.id) {
    return {
      data: null,
      error: "Comment not found.",
    };
  }

  return {
    data: { id: data.id },
    error: null,
  };
}
