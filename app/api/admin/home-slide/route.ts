import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateHomePaths } from "@/lib/cache/revalidate";
import {
  getAdminHomeSlideSources,
  getAdminHomeSlides,
  replaceAdminHomeSlides,
} from "@/lib/home/repository";
import type { HomeSlideInput, HomeSlideSourceType } from "@/types/home-slide";

// source 타입은 home-slide 정책(project/post)만 허용한다.
function parseSourceType(value: unknown): HomeSlideSourceType | null {
  return value === "project" || value === "post" ? value : null;
}

// 관리자 저장 payload를 HomeSlideInput 배열로 정규화한다.
function parsePayload(body: unknown): HomeSlideInput[] | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (!Array.isArray(source.items)) {
    return null;
  }

  const items: HomeSlideInput[] = [];

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

  const [slides, sources] = await Promise.all([getAdminHomeSlides(), getAdminHomeSlideSources()]);
  return NextResponse.json({ slides, sources });
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

  const result = await replaceAdminHomeSlides(payload);

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Failed to update home slides." },
      { status: 400 },
    );
  }

  await revalidateHomePaths();
  return NextResponse.json({ slides: result.data });
}
