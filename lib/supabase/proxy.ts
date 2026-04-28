import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("auth"));
}

export async function updateSupabaseSession(request: NextRequest) {
  const env = getSupabasePublicEnv();

  if (!env) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 비로그인 방문 요청에서는 인증 갱신 왕복을 생략해 TTFB를 줄인다.
  if (hasSupabaseAuthCookie(request)) {
    await supabase.auth.getUser();
  }

  return supabaseResponse;
}
