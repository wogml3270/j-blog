import Link from "next/link";
import { defaultLocale, withLocalePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export default function NotFound() {
  const dictionary = getDictionary(defaultLocale);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-sm text-muted">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {dictionary.notFound.title}
      </h1>
      <p className="text-base text-muted">{dictionary.notFound.description}</p>
      <Link href={withLocalePath(defaultLocale, "/")} className="text-sm font-medium underline">
        {dictionary.notFound.backHome}
      </Link>
    </main>
  );
}
