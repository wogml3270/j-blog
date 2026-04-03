import Link from "next/link";
import { BlogCard } from "@/components/blog/card";
import { SectionTitle } from "@/components/ui/section-title";
import type { BlogPostMeta } from "@/types/content";

type RecentPostsProps = {
  posts: BlogPostMeta[];
};

export function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <section aria-labelledby="recent-posts-title" className="space-y-6">
      <SectionTitle
        title="최근 블로그 글"
        description="구현 과정에서 배운 점과 기술적 의사결정을 정리한 글입니다."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      <Link href="/blog" className="inline-flex text-sm font-medium text-foreground underline">
        전체 글 보기
      </Link>
    </section>
  );
}
