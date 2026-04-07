import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { revalidateProfilePaths } from "@/lib/cache/revalidate";
import {
  getAdminProfileContent,
  type AdminHomeInput,
  upsertAdminHomeContent,
} from "@/lib/profile/repository";

function parseBody(body: unknown): AdminHomeInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.name !== "string" ||
    typeof source.title !== "string" ||
    typeof source.summary !== "string" ||
    !Array.isArray(source.techStack)
  ) {
    return null;
  }

  return {
    name: source.name.trim(),
    title: source.title.trim(),
    summary: source.summary.trim(),
    techStack: source.techStack.map((item) => String(item).trim()).filter(Boolean),
  };
}

export async function GET() {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const profile = await getAdminProfileContent("ko");
  return NextResponse.json({ home: profile });
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

  const result = await upsertAdminHomeContent(payload);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update home." }, { status: 400 });
  }

  revalidateProfilePaths();
  return NextResponse.json({ home: result.data });
}
