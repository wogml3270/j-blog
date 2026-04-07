import { BlogManager } from "@/components/admin/blog/blog-manager";
import { getAdminPosts } from "@/lib/blog/repository";
import { pickSingleQueryValue } from "@/lib/utils/search-params";

type AdminBlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const posts = await getAdminPosts();
  const query = await searchParams;
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">블로그 관리</h1>
      <BlogManager initialPosts={posts} initialSelectedId={initialSelectedId} />
    </main>
  );
}
