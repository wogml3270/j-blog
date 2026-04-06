"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, withLocalePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export default function LocalizedNotFound() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] ?? defaultLocale;
  const locale = isLocale(segment) ? segment : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-sm text-muted">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{dictionary.notFound.title}</h1>
      <p className="text-base text-muted">{dictionary.notFound.description}</p>
      <Link href={withLocalePath(locale, "/")} className="text-sm font-medium underline">
        {dictionary.notFound.backHome}
      </Link>
    </main>
  );
}
