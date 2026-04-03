import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

type HeroProps = {
  name: string;
  title: string;
  summary: string;
};

export function Hero({ name, title, summary }: HeroProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Portfolio & Tech Blog</p>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          {name}
          <span className="mt-1 block text-xl font-medium text-muted sm:text-2xl">{title}</span>
        </h1>
        <p className="max-w-3xl text-base text-muted sm:text-lg">{summary}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/projects" className={buttonStyles()}>
          프로젝트 보기
        </Link>
        <Link href="/blog" className={buttonStyles({ variant: "outline" })}>
          블로그 보기
        </Link>
      </div>
    </section>
  );
}
