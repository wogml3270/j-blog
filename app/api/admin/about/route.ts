import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateProfilePaths } from "@/lib/cache/revalidate";
import {
  getAdminProfileContent,
  type AdminAboutInput,
  upsertAdminAboutContent,
} from "@/lib/profile/repository";

function parseBody(body: unknown): AdminAboutInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.name !== "string" ||
    typeof source.title !== "string" ||
    typeof source.summary !== "string" ||
    typeof source.introDescription !== "string" ||
    typeof source.aboutPhotoUrl !== "string" ||
    typeof source.aboutExperience !== "string" ||
    typeof source.workStyle !== "string" ||
    !Array.isArray(source.techStack)
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
    techStack: source.techStack.map((item) => String(item).trim()).filter(Boolean),
    introDescription: source.introDescription.trim(),
    aboutPhotoUrl: source.aboutPhotoUrl.trim(),
    aboutTechItems,
    aboutExperience: source.aboutExperience.trim(),
    strengths: Array.isArray(source.strengths)
      ? source.strengths.map((item) => String(item).trim()).filter(Boolean)
      : [],
    workStyle: source.workStyle.trim(),
    status: source.status === "published" ? "published" : "draft",
  };
}

export async function GET() {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const profile = await getAdminProfileContent("ko");
  return NextResponse.json({ about: profile });
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

  revalidateProfilePaths();
  return NextResponse.json({ about: result.data });
}
