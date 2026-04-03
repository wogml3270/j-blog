import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/card";
import { SectionTitle } from "@/components/ui/section-title";
import { getAllPosts } from "@/lib/blog/registry";

export const metadata: Metadata = {
  title: "Blog",
  description: "MDX 기반 기술 블로그 목록",
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Blog"
        description="태그, 작성일, 목차 메타데이터를 포함한 MDX 기반 글 목록입니다."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.meta.slug} post={post.meta} />
        ))}
      </div>
    </div>
  );
}
