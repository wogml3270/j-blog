"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/toggle";
import { SITE_NAV_ITEMS } from "@/lib/site/navigation";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
          KimJoonho.dev
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav aria-label="메인 내비게이션" className="flex items-center gap-1">
            {SITE_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground",
                    isActive && "bg-foreground/10 text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
