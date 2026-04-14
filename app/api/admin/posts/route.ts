import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { createAdminPost, getAdminPostsPaginated } from "@/lib/blog/repository";
import { revalidateBlogPaths } from "@/lib/cache/revalidate";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeAdminListFilter, normalizeStatusScope } from "@/lib/utils/search-params";
import { normalizeSlug } from "@/lib/utils/slug";
import type { AdminPostInput, BlogTranslationMap } from "@/types/blog";

// 번역 payload는 EN/JA만 저장 대상으로 정규화한다.
function parseTranslations(source: Record<string, unknown>): BlogTranslationMap {
  const raw = source.translations;

  if (!raw || typeof raw !== "object") {
    return {};
  }

  const map = raw as Record<string, unknown>;
  const result: BlogTranslationMap = {};

  for (const locale of ["en", "ja"] as const) {
    const item = map[locale];

    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Record<string, unknown>;
    result[locale] = {
      title: typeof row.title === "string" ? row.title.trim() : "",
      description: typeof row.description === "string" ? row.description.trim() : "",
      bodyMarkdown: typeof row.bodyMarkdown === "string" ? row.bodyMarkdown : "",
      tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    };
  }

  return result;
}

// 관리자 게시글 입력 payload를 타입/정책 기준으로 정규화한다.
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
  const slug = normalizeSlug(source.slug);
  const tags = Array.isArray(source.tags)
    ? source.tags.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!slug) {
    return null;
  }

  return {
    slug,
    title: source.title.trim(),
    description: source.description.trim(),
    thumbnail: typeof source.thumbnail === "string" ? source.thumbnail.trim() || null : null,
    featured: Boolean(source.featured),
    syncSlugWithTitle: Boolean(source.syncSlugWithTitle),
    bodyMarkdown: source.bodyMarkdown,
    useMarkdownEditor: Boolean(source.useMarkdownEditor),
    status,
    publishedAt: typeof source.publishedAt === "string" ? source.publishedAt : null,
    scheduledPublishAt:
      typeof source.scheduledPublishAt === "string" ? source.scheduledPublishAt : null,
    tags,
    translations: parseTranslations(source),
  };
}

// 비공개 상태에서 메인 노출을 막아 상태 정책을 서버에서 강제한다.
function validateFeaturedPolicy(payload: AdminPostInput): string | null {
  if (payload.status === "draft" && payload.featured) {
    return "비공개 상태에서는 메인 페이지 노출을 설정할 수 없습니다.";
  }

  return null;
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
  const statusScope = normalizeStatusScope(url.searchParams.get("statusScope"));
  const result = await getAdminPostsPaginated(page, pageSize, filter, statusScope);

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

  const policyError = validateFeaturedPolicy(payload);

  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const result = await createAdminPost(payload, guard.user.id);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to create post." }, { status: 400 });
  }

  await revalidateBlogPaths(result.data.slug);
  return NextResponse.json({ post: result.data }, { status: 201 });
}
