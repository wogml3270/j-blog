import Link from "next/link";
import { BlogCard } from "@/components/blog/card";
import { SectionTitle } from "@/components/ui/section-title";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";
import type { BlogPostSummary } from "@/types/content";

type RecentPostsProps = {
  locale: Locale;
  posts: BlogPostSummary[];
  title: string;
  description: string;
  allPostsLabel: string;
};

export function RecentPosts({
  locale,
  posts,
  title,
  description,
  allPostsLabel,
}: RecentPostsProps) {
  return (
    <section aria-labelledby="recent-posts-title" className="space-y-6">
      <SectionTitle title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <BlogCard key={post.slug} post={post} locale={locale} animationDelay={80 + index * 60} />
        ))}
      </div>
      <Link href={withLocalePath(locale, "/blog")} className="inline-flex text-sm font-medium text-foreground underline">
        {allPostsLabel}
      </Link>
    </section>
  );
}
