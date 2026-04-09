import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { deleteAdminPost, updateAdminPost } from "@/lib/blog/repository";
import { revalidateBlogPaths } from "@/lib/cache/revalidate";
import type { AdminPostInput } from "@/types/blog";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseBody(body: unknown): AdminPostInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.slug !== "string" ||
    typeof source.title !== "string" ||
    typeof source.description !== "string" ||
    typeof source.bodyMarkdown !== "string"
  ) {
    return null;
  }

  const status = source.status === "published" ? "published" : "draft";
  const tags = Array.isArray(source.tags)
    ? source.tags.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    slug: source.slug.trim(),
    title: source.title.trim(),
    description: source.description.trim(),
    thumbnail: typeof source.thumbnail === "string" ? source.thumbnail.trim() || null : null,
    featured: Boolean(source.featured),
    bodyMarkdown: source.bodyMarkdown,
    useMarkdownEditor: Boolean(source.useMarkdownEditor),
    status,
    publishedAt: typeof source.publishedAt === "string" ? source.publishedAt : null,
    tags,
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await context.params;
  const payload = parseBody(await request.json());

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await updateAdminPost(id, payload);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update post." }, { status: 400 });
  }

  revalidateBlogPaths(result.data.slug);
  return NextResponse.json({ post: result.data });
}

export async function DELETE(_: Request, context: RouteContext) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await context.params;
  const result = await deleteAdminPost(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidateBlogPaths();
  return NextResponse.json({ success: true });
}
