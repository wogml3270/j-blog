import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateProjectPaths } from "@/lib/cache/revalidate";
import { deleteAdminProject, updateAdminProject } from "@/lib/projects/repository";
import { normalizeSlug } from "@/lib/utils/slug";
import type { AdminProjectInput, ProjectLinkItem, ProjectLinks } from "@/types/projects";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

      const key = `${label}::${url}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      next.push({ label, url });
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

    legacy.push({ label, url });
  }

  return normalize(legacy);
}

// 관리자 프로젝트 수정 payload를 타입/정책 기준으로 정규화한다.
function parseBody(body: unknown): AdminProjectInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.slug !== "string" ||
    typeof source.title !== "string" ||
    typeof source.summary !== "string" ||
    typeof source.thumbnail !== "string" ||
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
    thumbnail: source.thumbnail.trim(),
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
    achievements: Array.isArray(source.achievements)
      ? source.achievements.map((item) => String(item).trim()).filter(Boolean)
      : [],
    contributions: Array.isArray(source.contributions)
      ? source.contributions.map((item) => String(item).trim()).filter(Boolean)
      : [],
    links: toLinks(source.links),
    featured: Boolean(source.featured),
    status,
  };
}

// 비공개 상태에서는 메인 노출을 허용하지 않는다.
function validateFeaturedPolicy(payload: AdminProjectInput): string | null {
  if (payload.status === "draft" && payload.featured) {
    return "비공개 상태에서는 메인 페이지 노출을 설정할 수 없습니다.";
  }

  return null;
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

  const policyError = validateFeaturedPolicy(payload);

  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const result = await updateAdminProject(id, payload);

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Failed to update project." },
      { status: 400 },
    );
  }

  revalidateProjectPaths(result.data.slug);
  return NextResponse.json({ project: result.data });
}

export async function DELETE(_: Request, context: RouteContext) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await context.params;
  const result = await deleteAdminProject(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidateProjectPaths();
  return NextResponse.json({ success: true });
}
