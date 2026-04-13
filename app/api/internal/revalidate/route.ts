import { NextResponse } from "next/server";
import { revalidatePathsLocally } from "@/lib/cache/revalidate";

type RevalidateBody = {
  paths?: unknown;
};

function parsePaths(body: RevalidateBody): string[] {
  if (!Array.isArray(body.paths)) {
    return [];
  }

  return body.paths.map((item) => String(item).trim()).filter(Boolean);
}

// 외부 인스턴스(로컬/다른 환경)에서 전달한 경로를 현재 인스턴스에서 재검증한다.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim() || "";
  const headerSecret = request.headers.get("x-revalidate-secret")?.trim() || "";

  if (!secret || headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as RevalidateBody | null;
  const paths = parsePaths(body ?? {});

  if (paths.length === 0) {
    return NextResponse.json({ error: "Invalid paths" }, { status: 400 });
  }

  revalidatePathsLocally(paths);
  return NextResponse.json({ ok: true, count: paths.length });
}

