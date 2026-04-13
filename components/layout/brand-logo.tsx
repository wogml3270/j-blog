import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  href: string;
  title: string;
  subtitle: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function BrandLogo({ href, title, subtitle, className, onClick }: BrandLogoProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl border border-border/80 bg-linear-to-br from-surface to-surface/70 px-2.5 py-1.5 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-background font-mono text-[10px] font-bold">
        {"</>"}
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/70" />
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="bg-linear-to-r from-foreground to-foreground/65 bg-clip-text text-sm font-semibold tracking-tight text-transparent">
          {title}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent/90">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
