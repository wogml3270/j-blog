"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

type BlogErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function resolveLocale(pathname: string): Locale {
  const maybeLocale = pathname.split("/").filter(Boolean)[0];

  if (isLocale(maybeLocale)) {
    return maybeLocale;
  }

  return "ko";
}

export default function BlogErrorPage({ error, reset }: BlogErrorPageProps) {
  const pathname = usePathname();
  const locale = resolveLocale(pathname);
  const isUnavailable =
    error.name === "BlogServiceUnavailableError" ||
    error.message.toLowerCase().includes("supabase") ||
    error.message.toLowerCase().includes("database");
  const dictionary = getDictionary(locale);
  const copy = dictionary.blog.error;

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
      <h1 className="text-xl font-semibold text-foreground">
        {isUnavailable ? copy.unavailableTitle : copy.unexpectedTitle}
      </h1>
      <p className="text-sm text-muted">
        {isUnavailable ? copy.unavailableDescription : copy.unexpectedDescription}
      </p>
      <Button type="button" onClick={() => reset()}>
        {copy.retry}
      </Button>
    </section>
  );
}
