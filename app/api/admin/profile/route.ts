import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateProfilePaths } from "@/lib/cache/revalidate";
import {
  getAdminProfileContent,
  type AdminProfileInput,
  upsertAdminProfileContent,
} from "@/lib/profile/repository";

function parseBody(body: unknown): AdminProfileInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.name !== "string" ||
    typeof source.title !== "string" ||
    typeof source.summary !== "string" ||
    typeof source.aboutExperience !== "string" ||
    typeof source.workStyle !== "string"
  ) {
    return null;
  }

  return {
    name: source.name.trim(),
    title: source.title.trim(),
    summary: source.summary.trim(),
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

  const result = await upsertAdminProfileContent(payload);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update profile." }, { status: 400 });
  }

  revalidateProfilePaths();
  return NextResponse.json({ profile: result.data });
}
