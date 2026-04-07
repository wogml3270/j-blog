"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { ThemeToggle } from "@/components/theme/toggle";
import { cn } from "@/lib/utils/cn";

interface AdminSidebarProps {
  email: string | null;
};

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/home", label: "홈" },
  { href: "/admin/about", label: "소개" },
  { href: "/admin/projects", label: "프로젝트" },
  { href: "/admin/blog", label: "블로그" },
  { href: "/admin/contact", label: "문의함" },
];

export function AdminSidebar({ email }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-xl border border-border bg-surface p-3.5 sm:p-4 xl:sticky xl:top-6 xl:h-[calc(100dvh-3rem)] xl:w-[272px] xl:self-start">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <BrandLogo href="/admin/dashboard" title="Jaehee Park" subtitle="frontend engineer" />
          <ThemeToggle
            labels={{
              loadingLabel: "테마 로딩 중",
              toLightLabel: "라이트 모드로 전환",
              toDarkLabel: "다크 모드로 전환",
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 xl:block">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">관리자</p>
          <p className="truncate text-xs font-medium text-foreground sm:text-sm">{email ?? "unknown"}</p>
        </div>
      </div>

      <nav className="mt-4 flex flex-wrap gap-2 xl:block xl:space-y-1.5 xl:gap-0">
        {NAV_ITEMS.map((item) => {
          const isDashboard = item.href === "/admin/dashboard";
          const isActive = isDashboard
            ? pathname === "/admin/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm transition-colors xl:flex xl:w-full xl:justify-start xl:rounded-md xl:px-3 xl:py-2.5",
                isActive
                  ? "border-foreground/20 bg-foreground/10 text-foreground"
                  : "border-border bg-background text-muted hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 xl:mt-6 xl:flex-col xl:items-stretch">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-foreground/5 xl:w-full"
        >
          공개 사이트 이동
        </Link>
        <SignOutButton className="px-3 xl:w-full" />
      </div>
    </aside>
  );
}
