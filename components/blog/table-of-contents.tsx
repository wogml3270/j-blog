import type { TocItem } from "@/types/content";

type TableOfContentsProps = {
  items: TocItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <aside className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Table of Contents</h2>
      <ol className="space-y-2">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}>
            <a href={`#${item.id}`} className="text-sm text-foreground hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
