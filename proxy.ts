import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, withLocaleRoutePath } from "@/lib/i18n/config";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

const PUBLIC_FILE = /\.[^/]+$/;

function isLocaleRedirectBypassed(pathname: string) {
  return (
    pathname.startsWith("/api") || pathname.startsWith("/admin") || pathname.startsWith("/auth")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (isLocaleRedirectBypassed(pathname)) {
    return updateSupabaseSession(request);
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment && isLocale(firstSegment)) {
    if (firstSegment === defaultLocale) {
      const segments = pathname.split("/").filter(Boolean).slice(1);
      const normalizedPath = segments.length > 0 ? `/${segments.join("/")}` : "/";
      const url = request.nextUrl.clone();
      url.pathname = normalizedPath;
      return NextResponse.redirect(url);
    }

    return updateSupabaseSession(request);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = withLocaleRoutePath(defaultLocale, pathname);
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
