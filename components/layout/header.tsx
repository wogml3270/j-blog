"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/toggle";
import { Button } from "@/components/ui/button";
import {
  getPathWithoutLocale,
  locales,
  withLocalePath,
} from "@/lib/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { SITE_NAV_ITEMS } from "@/lib/site/navigation";
import { cn } from "@/lib/utils/cn";
import { usePublicUiStore } from "@/stores/public-ui";
import type { HeaderProps, LanguageSwitcherProps } from "@/types/ui";

function getNicknameFromUser(user: User | null): string {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.user_name,
    metadata.preferred_username,
    metadata.nickname,
  ];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) {
      return item.trim();
    }
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "";
  }

  return "";
}

function getAvatarFromUser(user: User | null): string {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata ?? {};
  const candidates = [metadata.avatar_url, metadata.picture];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) {
      return item.trim();
    }
  }

  return "";
}

function LanguageSwitcher({
  locale,
  currentPath,
  dictionary,
  onNavigate,
}: LanguageSwitcherProps) {
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
              "rounded px-2 py-1 text-xs font-semibold tracking-wide transition-colors",
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

export function Header({ locale, dictionary }: HeaderProps) {
  const pathname = usePathname();
  const currentPath = getPathWithoutLocale(pathname);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthAvailable] = useState<boolean>(() => hasSupabasePublicEnv());
  const [user, setUser] = useState<User | null>(null);
  const isAuthModalOpen = usePublicUiStore((state) => state.isAuthModalOpen);
  const openAuthModal = usePublicUiStore((state) => state.openAuthModal);
  const closeAuthModal = usePublicUiStore((state) => state.closeAuthModal);

  const nickname = useMemo(() => getNicknameFromUser(user), [user]);
  const avatarUrl = useMemo(() => getAvatarFromUser(user), [user]);

  useEffect(() => {
    if (!isAuthAvailable) {
      return;
    }

    let supabase: ReturnType<typeof getSupabaseBrowserClient> | null = null;
    let isMounted = true;

    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      return;
    }

    const bootstrap = async () => {
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(data.user ?? null);
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [isAuthAvailable]);

  useEffect(() => {
    if (!isMobileMenuOpen && !isAuthModalOpen) {
      return;
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isAuthModalOpen) {
        closeAuthModal();
        return;
      }

      setIsMobileMenuOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeydown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeydown);
    };
  }, [closeAuthModal, isAuthModalOpen, isMobileMenuOpen]);

  const onSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    closeAuthModal();
  };

  const authNextPath = pathname || withLocalePath(locale, "/");
  const authModal = (
    <>
      <div
        aria-hidden={!isAuthModalOpen}
        className={cn(
          "fixed inset-0 z-120 bg-foreground/35 backdrop-blur-xs transition-opacity duration-300",
          isAuthModalOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeAuthModal}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={dictionary.header.authTitle}
        className={cn(
          "fixed left-1/2 top-1/2 z-130 w-11/12 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-4 shadow-2xl transition-all duration-300",
          isAuthModalOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{dictionary.header.authTitle}</h2>
            <p className="text-sm text-muted">{dictionary.header.authDescription}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={dictionary.header.closeAuthModalLabel}
            onClick={closeAuthModal}
          >
            ×
          </Button>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={nickname || "user"} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-foreground">
                  {(nickname || user.email || "U").slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{nickname || user.email}</p>
                <p className="truncate text-xs text-muted">
                  {dictionary.header.authSignedInAs} {user.email}
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={onSignOut}>
              {dictionary.header.authSignOut}
            </Button>
          </div>
        ) : !isAuthAvailable ? (
          <p className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted">
            {dictionary.header.authSupabaseRequired}
          </p>
        ) : (
          <SocialLoginButtons nextPath={authNextPath} variant="public" />
        )}
      </aside>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 shadow-sm backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-3 sm:gap-4">
        <BrandLogo
          href={withLocalePath(locale, "/")}
          title={dictionary.header.brandTitle}
          subtitle={dictionary.header.brandSubtitle}
        />

        <div className="hidden items-center gap-2.5 lg:flex">
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
                    "after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-0.5 after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300",
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
          <Button
            variant="outline"
            size="sm"
            aria-label={dictionary.header.openAuthModalLabel}
            onClick={openAuthModal}
            className={cn("h-9", user ? "w-9 px-0! border-0" : "px-3")}
          >
            {user ? (
              avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={nickname || "user"} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-foreground">
                  {(nickname || user.email || "U").slice(0, 1).toUpperCase()}
                </span>
              )
            ) : (
              dictionary.header.authSignInCta
            )}
          </Button>
          <ThemeToggle labels={dictionary.theme} />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            aria-label={dictionary.header.openAuthModalLabel}
            onClick={() => {
              setIsMobileMenuOpen(false);
              openAuthModal();
            }}
            className="h-9 w-9 px-0"
          >
            {user ? (
              avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={nickname || "user"} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-semibold">{(nickname || user.email || "U").slice(0, 1).toUpperCase()}</span>
              )
            ) : (
              <span className="text-xs font-semibold">U</span>
            )}
          </Button>
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
                  isMobileMenuOpen ? "translate-y-1.5 rotate-45" : "",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 block h-0.5 w-4 bg-foreground transition-opacity duration-200",
                  isMobileMenuOpen ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-3 block h-0.5 w-4 origin-center bg-foreground transition-transform duration-300 ease-out",
                  isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : "",
                )}
              />
            </span>
          </Button>
        </div>
        </Container>
      </header>
      <div
        aria-hidden={!isMobileMenuOpen}
        className={cn(
          "fixed inset-0 z-90 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 top-16 z-100 overflow-x-clip lg:hidden">
        <div
          id="mobile-navigation"
          className={cn(
            "absolute right-0 top-0 flex h-full w-80 max-w-full flex-col gap-4 border-l border-border bg-linear-to-b from-surface/95 to-background/95 p-5 shadow-2xl transition-transform duration-300 ease-out",
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
      {isMounted ? createPortal(authModal, document.body) : null}
    </>
  );
}
