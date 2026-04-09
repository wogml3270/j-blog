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
    typeof source.aboutExperience !== "string" ||
    typeof source.workStyle !== "string" ||
    !Array.isArray(source.techStack)
  ) {
    return null;
  }

  return {
    name: source.name.trim(),
    title: source.title.trim(),
    summary: source.summary.trim(),
    techStack: source.techStack.map((item) => String(item).trim()).filter(Boolean),
    introDescription: source.introDescription.trim(),
    aboutPhotoUrl: typeof source.aboutPhotoUrl === "string" ? source.aboutPhotoUrl.trim() : "",
    aboutTechItems: Array.isArray(source.aboutTechItems)
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
      : [],
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
  return NextResponse.json({ profile });
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

  const aboutResult = await upsertAdminAboutContent(payload);

  if (aboutResult.error || !aboutResult.data) {
    return NextResponse.json(
      { error: aboutResult.error ?? "Failed to update profile(about)." },
      { status: 400 },
    );
  }

  revalidateProfilePaths();
  return NextResponse.json({ profile: aboutResult.data });
}
