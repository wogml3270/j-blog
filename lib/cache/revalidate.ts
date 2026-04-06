import { revalidatePath } from "next/cache";
import { locales, withLocalePath } from "@/lib/i18n/config";

export function revalidateBlogPaths(slug?: string) {
  for (const locale of locales) {
    revalidatePath(withLocalePath(locale, "/"));
    revalidatePath(withLocalePath(locale, "/blog"));

    if (slug) {
      revalidatePath(withLocalePath(locale, `/blog/${slug}`));
    }
  }
}

export function revalidateProjectPaths(slug?: string) {
  for (const locale of locales) {
    revalidatePath(withLocalePath(locale, "/"));
    revalidatePath(withLocalePath(locale, "/projects"));

    if (slug) {
      revalidatePath(withLocalePath(locale, `/projects/${slug}`));
    }
  }
}

export function revalidateProfilePaths() {
  for (const locale of locales) {
    revalidatePath(withLocalePath(locale, "/"));
    revalidatePath(withLocalePath(locale, "/about"));
  }
}
