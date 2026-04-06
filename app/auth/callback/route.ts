import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toSafeNextPath(raw: string | null): string {
  if (!raw) {
    return "/admin";
  }

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/admin";
  }

  return raw;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = toSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    const url = new URL("/admin/login", requestUrl.origin);
    url.searchParams.set("reason", "missing_code");
    return NextResponse.redirect(url);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const url = new URL("/admin/login", requestUrl.origin);
    url.searchParams.set("reason", "supabase_not_configured");
    return NextResponse.redirect(url);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL("/admin/login", requestUrl.origin);
    url.searchParams.set("reason", "oauth_failed");
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
