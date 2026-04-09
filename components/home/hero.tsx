import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { SlideIn } from "@/components/ui/slide-in";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";

type HeroProps = {
  locale: Locale;
  name: string;
  title: string;
  summary: string;
  eyebrow: string;
  viewProjectsLabel: string;
  viewBlogLabel: string;
};

export function Hero({
  locale,
  name,
  title,
  summary,
  eyebrow,
  viewProjectsLabel,
  viewBlogLabel,
}: HeroProps) {
  return (
    <SlideIn direction="left" distance={20}>
      <section className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {name}
            <span className="mt-1 block text-xl font-medium text-muted sm:text-2xl">{title}</span>
          </h1>
          <p className="max-w-3xl text-base text-muted sm:text-lg">{summary}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={withLocalePath(locale, "/projects")} className={buttonStyles()}>
            {viewProjectsLabel}
          </Link>
          <Link
            href={withLocalePath(locale, "/blog")}
            className={buttonStyles({ variant: "outline" })}
          >
            {viewBlogLabel}
          </Link>
        </div>
      </section>
    </SlideIn>
  );
}
