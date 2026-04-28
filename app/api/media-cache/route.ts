import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// 공개 미디어 캐시는 Supabase public object만 허용해 SSRF를 방지한다.
function isAllowedMediaUrl(raw: string): boolean {
  const env = getSupabasePublicEnv();

  if (!env) {
    return false;
  }

  try {
    const target = new URL(raw);
    const base = new URL(env.url);

    if (target.protocol !== "https:") {
      return false;
    }

    if (target.hostname !== base.hostname) {
      return false;
    }

    return target.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url")?.trim() ?? "";

  if (!rawUrl || !isAllowedMediaUrl(rawUrl)) {
    return NextResponse.json({ error: "허용되지 않은 미디어 URL입니다." }, { status: 400 });
  }

  const upstream = await fetch(rawUrl, {
    next: { revalidate: ONE_YEAR_IN_SECONDS },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "미디어를 불러오지 못했습니다." }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 응답이 아닙니다." }, { status: 400 });
  }

  const body = await upstream.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
    },
  });
}
