import { PostsManager } from "@/components/admin/posts-manager";
import { getAdminPosts } from "@/lib/blog/repository";

type AdminBlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const posts = await getAdminPosts();
  const query = await searchParams;
  const initialSelectedId = pickQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">블로그 관리</h1>
      <PostsManager initialPosts={posts} initialSelectedId={initialSelectedId} />
    </main>
  );
}
