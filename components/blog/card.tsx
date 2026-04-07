import Image from "next/image";
import Link from "next/link";
import { SlideIn } from "@/components/ui/slide-in";
import { Tag } from "@/components/ui/tag";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils/format-date";
import type { BlogPostSummary } from "@/types/content";

interface BlogCardProps {
  post: BlogPostSummary;
  locale: Locale;
  animationDelay?: number;
};

export function BlogCard({ post, locale, animationDelay = 0 }: BlogCardProps) {
  return (
    <SlideIn delay={animationDelay} distance={16}>
      <Link
        href={withLocalePath(locale, `/blog/${post.slug}`)}
        className="group block rounded-xl border border-border bg-surface transition-colors hover:border-foreground/30"
      >
        {post.thumbnail ? (
          <div className="aspect-video overflow-hidden rounded-t-xl border-b border-border bg-foreground/5">
            <Image
              src={post.thumbnail}
              alt={`${post.title} thumbnail`}
              width={1200}
              height={675}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        ) : null}
        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            <span aria-hidden="true">•</span>
            <span>{post.readingTime}</span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:underline">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-muted">{post.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={`${post.slug}-${tag}`}>{tag}</Tag>
            ))}
          </div>
        </div>
      </Link>
    </SlideIn>
  );
}
