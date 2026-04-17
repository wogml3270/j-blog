"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { TocItem } from "@/types/blog";

interface TableOfContentsProps {
  items: TocItem[];
  title: string;
}

export function TableOfContents({ items, title }: TableOfContentsProps) {
  const handleAnchorClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href");

    if (!href?.startsWith("#")) {
      return;
    }

    const nextHash = href.slice(1);
    const target = document.getElementById(nextHash);

    if (!target) {
      return;
    }

    event.preventDefault();
    window.history.replaceState(null, "", `#${nextHash}`);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <aside className="w-full max-w-[220px] rounded-xl border border-border bg-surface/85 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <ol className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="min-w-0" style={{ paddingLeft: `${(item.level - 2) * 0.6}rem` }}>
            <a
              href={`#${item.id}`}
              onClick={handleAnchorClick}
              className="block truncate text-[13px] text-foreground/90 transition-colors duration-200 hover:text-foreground hover:underline"
              title={item.text}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
