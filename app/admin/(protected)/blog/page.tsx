import { BlogManager } from "@/components/admin/blog/blog-manager";
import { getAdminPostsPaginated } from "@/lib/blog/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

export default async function AdminBlogPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const query = await searchParams;
  const { page, pageSize } = normalizePagination(
    pickSingleQueryValue(query.page),
    pickSingleQueryValue(query.pageSize),
  );
  const initialPage = await getAdminPostsPaginated(page, pageSize);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">블로그 관리</h1>
      <BlogManager initialPage={initialPage} initialSelectedId={initialSelectedId} />
    </main>
  );
}
