import Link from "next/link";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/utils/format-date";
import type { BlogPostMeta } from "@/types/content";

type BlogCardProps = {
  post: BlogPostMeta;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground/30">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden="true">•</span>
        <span>{post.readingTime}</span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-muted">{post.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Tag key={`${post.slug}-${tag}`}>{tag}</Tag>
        ))}
      </div>
    </article>
  );
}
