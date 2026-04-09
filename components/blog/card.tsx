import Image from "next/image";
import { SlideIn } from "@/components/ui/slide-in";
import { Tag } from "@/components/ui/tag";
import { MediaCard } from "@/components/ui/media-card";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils/format-date";
import type { BlogPostSummary } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostSummary;
  locale: Locale;
  animationDelay?: number;
}

export function BlogCard({ post, locale, animationDelay = 0 }: BlogCardProps) {
  // 블로그 목록/홈 카드가 동일한 링크/메타 구조를 쓰도록 공통 카드 컴포넌트를 사용한다.
  return (
    <SlideIn delay={animationDelay} distance={16}>
      <MediaCard
        href={withLocalePath(locale, `/blog/${post.slug}`)}
        media={
          post.thumbnail ? (
            <div className="aspect-video overflow-hidden rounded-t-xl border-b border-border bg-foreground/5">
              <Image
                src={post.thumbnail}
                alt={`${post.title} thumbnail`}
                width={1200}
                height={675}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ) : undefined
        }
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </div>
        }
        title={post.title}
        description={post.description}
        tags={
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <Tag key={`${post.slug}-${tag}`}>{tag}</Tag>
            ))}
          </div>
        }
        bodyClassName="space-y-3.5 p-5"
      />
    </SlideIn>
  );
}
