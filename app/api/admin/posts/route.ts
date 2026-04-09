import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { createAdminPost, getAdminPostsPaginated } from "@/lib/blog/repository";
import { revalidateBlogPaths } from "@/lib/cache/revalidate";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeAdminListFilter } from "@/lib/utils/search-params";
import type { AdminPostInput } from "@/types/blog";

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

// 관리자 게시글 목록은 page/pageSize 기반 응답으로 통일한다.
export async function GET(request: Request) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const url = new URL(request.url);
  const { page, pageSize } = normalizePagination(
    url.searchParams.get("page"),
    url.searchParams.get("pageSize"),
  );
  const filter = normalizeAdminListFilter(url.searchParams.get("filter"));
  const result = await getAdminPostsPaginated(page, pageSize, filter);

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const payload = parseBody(await request.json());

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await createAdminPost(payload, guard.user.id);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to create post." }, { status: 400 });
  }

  revalidateBlogPaths(result.data.slug);
  return NextResponse.json({ post: result.data }, { status: 201 });
}
