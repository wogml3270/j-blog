import { PostsManager } from "@/components/admin/posts-manager";
import { getAdminPosts } from "@/lib/blog/repository";

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Blog 관리</h1>
      <PostsManager initialPosts={posts} />
    </main>
  );
}
