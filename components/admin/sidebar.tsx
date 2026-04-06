"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { cn } from "@/lib/utils/cn";

type AdminSidebarProps = {
  email: string | null;
};

const NAV_ITEMS = [
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/project", label: "Project" },
  { href: "/admin/profile", label: "Profile" },
];

export function AdminSidebar({ email }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:w-[260px] lg:self-start">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Admin</p>
        <p className="truncate text-sm font-medium text-foreground">{email ?? "unknown"}</p>
      </div>

      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "block rounded-md border px-3 py-2 text-sm transition-colors",
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

      <div className="mt-6 space-y-2">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-foreground/5"
        >
          공개 사이트로 이동
        </Link>
        <SignOutButton />
      </div>
    </aside>
  );
}
