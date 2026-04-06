import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateProjectPaths } from "@/lib/cache/revalidate";
import {
  deleteAdminProject,
  type AdminProjectInput,
  updateAdminProject,
} from "@/lib/projects/repository";
import type { ProjectLinks } from "@/types/content";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toLinks(value: unknown): ProjectLinks {
  if (!value || typeof value !== "object") {
    return {};
  }

  const raw = value as Record<string, unknown>;

  return {
    live: typeof raw.live === "string" ? raw.live : undefined,
    repo: typeof raw.repo === "string" ? raw.repo : undefined,
    detail: typeof raw.detail === "string" ? raw.detail : undefined,
  };
}

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
    typeof source.role !== "string" ||
    typeof source.period !== "string"
  ) {
    return null;
  }

  const status = source.status === "published" ? "published" : "draft";

  return {
    slug: source.slug.trim(),
    title: source.title.trim(),
    summary: source.summary.trim(),
    thumbnail: source.thumbnail.trim(),
    role: source.role.trim(),
    period: source.period.trim(),
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

  const result = await updateAdminProject(id, payload);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update project." }, { status: 400 });
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
