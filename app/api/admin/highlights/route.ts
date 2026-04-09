import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateHomePaths } from "@/lib/cache/revalidate";
import {
  getAdminHomeHighlights,
  getAdminHomeHighlightSources,
  replaceAdminHomeHighlights,
} from "@/lib/home/repository";
import type { HomeHighlightInput, HomeHighlightSourceType } from "@/types/home";

function parseSourceType(value: unknown): HomeHighlightSourceType | null {
  return value === "project" || value === "post" ? value : null;
}

function parsePayload(body: unknown): HomeHighlightInput[] | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (!Array.isArray(source.items)) {
    return null;
  }

  const items: HomeHighlightInput[] = [];

  for (const rawItem of source.items) {
    if (!rawItem || typeof rawItem !== "object") {
      continue;
    }

    const record = rawItem as Record<string, unknown>;
    const sourceType = parseSourceType(record.sourceType);

    if (!sourceType || typeof record.sourceId !== "string") {
      continue;
    }

    items.push({
      sourceType,
      sourceId: record.sourceId.trim(),
      orderIndex: Number(record.orderIndex) || 0,
      isActive: record.isActive !== false,
      overrideTitle: typeof record.overrideTitle === "string" ? record.overrideTitle : null,
      overrideDescription:
        typeof record.overrideDescription === "string" ? record.overrideDescription : null,
      overrideImageUrl:
        typeof record.overrideImageUrl === "string" ? record.overrideImageUrl : null,
      overrideCtaLabel:
        typeof record.overrideCtaLabel === "string" ? record.overrideCtaLabel : null,
    });
  }

  return items;
}

export async function GET() {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const [highlights, sources] = await Promise.all([
    getAdminHomeHighlights(),
    getAdminHomeHighlightSources(),
  ]);

  return NextResponse.json({ highlights, sources });
}

export async function PUT(request: Request) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const payload = parsePayload(await request.json());

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await replaceAdminHomeHighlights(payload);

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Failed to update highlights." },
      { status: 400 },
    );
  }

  revalidateHomePaths();
  return NextResponse.json({ highlights: result.data });
}
