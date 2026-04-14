import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateProfilePaths } from "@/lib/cache/revalidate";
import {
  getAdminAboutContent,
  type AdminAboutInput,
  upsertAdminAboutContent,
} from "@/lib/profile/repository";
import type { AboutTranslationMap } from "@/types/about";

// 번역 payload는 EN/JA만 저장 대상으로 정규화한다.
function parseTranslations(source: Record<string, unknown>): AboutTranslationMap {
  const raw = source.translations;

  if (!raw || typeof raw !== "object") {
    return {};
  }

  const map = raw as Record<string, unknown>;
  const result: AboutTranslationMap = {};

  for (const locale of ["en", "ja"] as const) {
    const item = map[locale];

    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Record<string, unknown>;
    const aboutTechItems = Array.isArray(row.aboutTechItems)
      ? row.aboutTechItems
          .filter((tech) => tech && typeof tech === "object")
          .map((tech) => {
            const target = tech as Record<string, unknown>;

            return {
              name: typeof target.name === "string" ? target.name.trim() : "",
              description: typeof target.description === "string" ? target.description.trim() : "",
              logoUrl: typeof target.logoUrl === "string" ? target.logoUrl.trim() : "",
            };
          })
          .filter((tech) => tech.name && tech.description && tech.logoUrl)
      : [];

    result[locale] = {
      name: typeof row.name === "string" ? row.name.trim() : "",
      title: typeof row.title === "string" ? row.title.trim() : "",
      summary: typeof row.summary === "string" ? row.summary.trim() : "",
      aboutTechItems,
    };
  }

  return result;
}

function parseBody(body: unknown): AdminAboutInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.name !== "string" ||
    typeof source.title !== "string" ||
    typeof source.summary !== "string" ||
    typeof source.aboutPhotoUrl !== "string"
  ) {
    return null;
  }

  const aboutTechItems = Array.isArray(source.aboutTechItems)
    ? source.aboutTechItems
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const raw = item as Record<string, unknown>;
          const name = typeof raw.name === "string" ? raw.name.trim() : "";
          const description = typeof raw.description === "string" ? raw.description.trim() : "";
          const logoUrl = typeof raw.logoUrl === "string" ? raw.logoUrl.trim() : "";

          if (!name || !description || !logoUrl) {
            return null;
          }

          return { name, description, logoUrl };
        })
        .filter(
          (item): item is { name: string; description: string; logoUrl: string } => item !== null,
        )
    : [];

  return {
    name: source.name.trim(),
    title: source.title.trim(),
    summary: source.summary.trim(),
    aboutPhotoUrl: source.aboutPhotoUrl.trim(),
    aboutTechItems,
    translations: parseTranslations(source),
  };
}

export async function GET() {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const about = await getAdminAboutContent("ko");
  return NextResponse.json({ about });
}

export async function PUT(request: Request) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const payload = parseBody(await request.json());

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await upsertAdminAboutContent(payload);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update about." }, { status: 400 });
  }

  await revalidateProfilePaths();
  return NextResponse.json({ about: result.data });
}
