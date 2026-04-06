"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/toggle";
import { Button } from "@/components/ui/button";
import {
  getPathWithoutLocale,
  locales,
  type Locale,
  withLocalePath,
} from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { SITE_NAV_ITEMS } from "@/lib/site/navigation";
import { cn } from "@/lib/utils/cn";

type HeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
};

function LanguageSwitcher({
  locale,
  currentPath,
  dictionary,
  onNavigate,
}: {
  locale: Locale;
  currentPath: string;
  dictionary: Dictionary;
  onNavigate?: () => void;
}) {
  return (
    <div
      aria-label={dictionary.language.ariaLabel}
      className="inline-flex items-center rounded-md border border-border bg-surface p-0.5"
      role="group"
    >
      {locales.map((item) => {
        const isCurrent = item === locale;

        return (
          <Link
            key={item}
            href={withLocalePath(item, currentPath)}
            onClick={onNavigate}
            aria-current={isCurrent ? "true" : undefined}
            className={cn(
              "rounded px-2 py-1 text-[11px] font-semibold tracking-wide transition-colors",
              isCurrent
                ? "bg-accent text-background"
                : "text-muted hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {item.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}

function BrandLogo({
  locale,
  title,
  subtitle,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={withLocalePath(locale, "/")}
      className="group inline-flex items-center gap-2.5 rounded-xl border border-border/80 bg-linear-to-br from-surface to-surface/70 px-2.5 py-1.5 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-background font-mono text-[10px] font-bold">
        {"</>"}
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent">
          <span className="absolute inset-0 rounded-full bg-accent/70 animate-ping" />
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

export function Header({ locale, dictionary }: HeaderProps) {
  const pathname = usePathname();
  const currentPath = getPathWithoutLocale(pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeydown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeydown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 shadow-[0_2px_20px_rgba(15,118,110,0.05)] backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <BrandLogo
          locale={locale}
          title={dictionary.header.brandTitle}
          subtitle={dictionary.header.brandSubtitle}
        />

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher locale={locale} currentPath={currentPath} dictionary={dictionary} />
          <nav aria-label={dictionary.header.mainNavigationAria} className="flex items-center gap-1.5">
            {SITE_NAV_ITEMS.map((item) => {
              const href = withLocalePath(locale, item.href);
              const isActive =
                item.href === "/"
                  ? currentPath === "/"
                  : currentPath === item.href || currentPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.key}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-all duration-300 hover:text-foreground",
                    "after:absolute after:bottom-0.5 after:left-3 after:h-[2px] after:w-[calc(100%-1.5rem)] after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300",
                    isActive
                      ? "bg-foreground/10 text-foreground after:scale-x-100"
                      : "after:scale-x-0 group-hover:after:scale-x-100",
                  )}
                >
                  {dictionary.nav[item.key]}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle labels={dictionary.theme} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle labels={dictionary.theme} />
          <Button
            variant="outline"
            size="sm"
            aria-label={
              isMobileMenuOpen
                ? dictionary.header.closeMobileMenuLabel
                : dictionary.header.openMobileMenuLabel
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="w-10 px-0 transition-transform duration-300 active:scale-95"
          >
            <span className="relative block h-4 w-4">
              <span
                className={cn(
                  "absolute left-0 top-0 block h-0.5 w-4 origin-center bg-foreground transition-transform duration-300 ease-out",
                  isMobileMenuOpen ? "translate-y-[7px] rotate-45" : "",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[7px] block h-0.5 w-4 bg-foreground transition-opacity duration-200",
                  isMobileMenuOpen ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[14px] block h-0.5 w-4 origin-center bg-foreground transition-transform duration-300 ease-out",
                  isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : "",
                )}
              />
            </span>
          </Button>
        </div>
      </Container>

      <div
        aria-hidden={!isMobileMenuOpen}
        className={cn(
          "fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className="pointer-events-none fixed inset-x-0 top-16 z-60 h-[calc(100dvh-4rem)] overflow-x-clip md:hidden">
        <div
          id="mobile-navigation"
          className={cn(
            "absolute right-0 top-0 flex h-full w-[min(84vw,20rem)] flex-col gap-4 border-l border-border bg-linear-to-b from-surface/95 to-background/95 p-5 shadow-2xl transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-full",
          )}
        >
          <LanguageSwitcher
            locale={locale}
            currentPath={currentPath}
            dictionary={dictionary}
            onNavigate={() => setIsMobileMenuOpen(false)}
          />

          <nav aria-label={dictionary.header.mobileNavigationAria} className="flex flex-col gap-1.5">
            {SITE_NAV_ITEMS.map((item, index) => {
              const href = withLocalePath(locale, item.href);
              const isActive =
                item.href === "/"
                  ? currentPath === "/"
                  : currentPath === item.href || currentPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.key}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ transitionDelay: isMobileMenuOpen ? `${index * 45}ms` : "0ms" }}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-all duration-300",
                    "hover:translate-x-1 hover:bg-foreground/5 hover:text-foreground",
                    isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0",
                    isActive && "bg-foreground/10 text-foreground",
                  )}
                >
                  {dictionary.nav[item.key]}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
