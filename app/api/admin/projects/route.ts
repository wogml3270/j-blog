import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateProjectPaths } from "@/lib/cache/revalidate";
import { createAdminProject, getAdminProjectsPaginated } from "@/lib/projects/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeAdminListFilter, normalizeStatusScope } from "@/lib/utils/search-params";
import { normalizeSlug } from "@/lib/utils/slug";
import type {
  AdminProjectInput,
  ProjectLinkItem,
  ProjectLinks,
  ProjectTranslationMap,
} from "@/types/projects";

// 번역 payload는 EN/JA만 저장 대상으로 정규화한다.
function parseTranslations(source: Record<string, unknown>): ProjectTranslationMap {
  const raw = source.translations;

  if (!raw || typeof raw !== "object") {
    return {};
  }

  const map = raw as Record<string, unknown>;
  const result: ProjectTranslationMap = {};

  for (const locale of ["en", "ja"] as const) {
    const item = map[locale];

    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Record<string, unknown>;
    result[locale] = {
      title: typeof row.title === "string" ? row.title.trim() : "",
      subtitle: typeof row.subtitle === "string" ? row.subtitle.trim() : "",
      contentMarkdown: typeof row.contentMarkdown === "string" ? row.contentMarkdown : "",
      tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    };
  }

  return result;
}

function toLinks(value: unknown): ProjectLinks {
  const normalize = (items: ProjectLinkItem[]): ProjectLinks => {
    const seen = new Set<string>();
    const next: ProjectLinks = [];

    for (const item of items) {
      const label = item.label.trim();
      const url = item.url.trim();

      if (!label || !url) {
        continue;
      }

      const isPublic = typeof item.isPublic === "boolean" ? item.isPublic : true;
      const key = `${label}::${url}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      next.push({ label, url, isPublic });
    }

    return next;
  };

  if (Array.isArray(value)) {
    return normalize(
      value
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const raw = item as Record<string, unknown>;

          return {
            label: typeof raw.label === "string" ? raw.label : "",
            url: typeof raw.url === "string" ? raw.url : "",
            isPublic: typeof raw.isPublic === "boolean" ? raw.isPublic : true,
          };
        }),
    );
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const raw = value as Record<string, unknown>;
  const legacy: ProjectLinkItem[] = [];

  for (const [key, maybeUrl] of Object.entries(raw)) {
    if (typeof maybeUrl !== "string") {
      continue;
    }

    const url = maybeUrl.trim();

    if (!url) {
      continue;
    }

    const label =
      key === "live"
        ? "Live"
        : key === "repo"
          ? "Repository"
          : key === "detail"
            ? "Case Study"
            : key;

    legacy.push({ label, url, isPublic: true });
  }

  return normalize(legacy);
}

// 관리자 프로젝트 입력 payload를 타입/정책 기준으로 정규화한다.
function parseBody(body: unknown): AdminProjectInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.slug !== "string" ||
    typeof source.title !== "string" ||
    typeof source.summary !== "string" ||
    typeof source.role !== "string"
  ) {
    return null;
  }

  const status = source.status === "published" ? "published" : "draft";
  const slug = normalizeSlug(source.slug);

  if (!slug) {
    return null;
  }

  return {
    slug,
    title: source.title.trim(),
    homeSummary:
      typeof source.homeSummary === "string" ? source.homeSummary.trim() : source.summary.trim(),
    summary: source.summary.trim(),
    syncSlugWithTitle: Boolean(source.syncSlugWithTitle),
    useSummaryEditor: Boolean(source.useSummaryEditor),
    thumbnail:
      typeof source.thumbnail === "string" && source.thumbnail.trim()
        ? source.thumbnail.trim()
        : "/projects/default-thumbnail.svg",
    role: source.role.trim(),
    period: typeof source.period === "string" ? source.period.trim() : undefined,
    startDate:
      typeof source.startDate === "string" && source.startDate.trim()
        ? source.startDate.trim()
        : null,
    endDate:
      typeof source.endDate === "string" && source.endDate.trim() ? source.endDate.trim() : null,
    techStack: Array.isArray(source.techStack)
      ? source.techStack.map((item) => String(item).trim()).filter(Boolean)
      : [],
    links: toLinks(source.links),
    featured: Boolean(source.featured),
    status,
    translations: parseTranslations(source),
  };
}

// 비공개 상태에서는 메인 노출을 허용하지 않는다.
function validateFeaturedPolicy(payload: AdminProjectInput): string | null {
  if (payload.status === "draft" && payload.featured) {
    return "비공개 상태에서는 메인 페이지 노출을 설정할 수 없습니다.";
  }

  return null;
}

// 관리자 프로젝트 목록은 페이지네이션 메타와 함께 반환한다.
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
  const result = await getAdminProjectsPaginated(page, pageSize, filter, statusScope);

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

  const result = await createAdminProject(payload);

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Failed to create project." },
      { status: 400 },
    );
  }

  await revalidateProjectPaths(result.data.slug);
  return NextResponse.json({ project: result.data }, { status: 201 });
}
