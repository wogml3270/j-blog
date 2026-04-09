import { revalidatePath } from "next/cache";
import { locales, withLocalePath } from "@/lib/i18n/config";
import { encodeSlugSegment } from "@/lib/utils/slug";

export function revalidateHomePaths() {
  for (const locale of locales) {
    revalidatePath(withLocalePath(locale, "/"));
  }
}

// 블로그 관련 정적 경로를 locale별로 일괄 revalidate 한다.
export function revalidateBlogPaths(slug?: string) {
  for (const locale of locales) {
    revalidatePath(withLocalePath(locale, "/"));
    revalidatePath(withLocalePath(locale, "/blog"));

    if (slug) {
      revalidatePath(withLocalePath(locale, `/blog/${encodeSlugSegment(slug)}`));
    }
  }
}

// 프로젝트 관련 정적 경로를 locale별로 일괄 revalidate 한다.
export function revalidateProjectPaths(slug?: string) {
  for (const locale of locales) {
    revalidatePath(withLocalePath(locale, "/"));
    revalidatePath(withLocalePath(locale, "/projects"));

    if (slug) {
      revalidatePath(withLocalePath(locale, `/projects/${encodeSlugSegment(slug)}`));
    }
  }
}

export function revalidateProfilePaths() {
  for (const locale of locales) {
    revalidatePath(withLocalePath(locale, "/"));
    revalidatePath(withLocalePath(locale, "/about"));
  }
}
