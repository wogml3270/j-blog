import { BlogManager } from "@/components/admin/blog/blog-manager";
import { getAdminPostsPaginated } from "@/lib/blog/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeAdminListFilter, pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

function normalizeSectionPage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminBlogPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const query = await searchParams;
  const { pageSize } = normalizePagination(null, pickSingleQueryValue(query.pageSize));
  const initialFilter = normalizeAdminListFilter(pickSingleQueryValue(query.filter));
  const mainPage = normalizeSectionPage(pickSingleQueryValue(query.mainPage));
  const privatePage = normalizeSectionPage(pickSingleQueryValue(query.privatePage));
  const [initialMainPage, initialPrivatePage] = await Promise.all([
    getAdminPostsPaginated(mainPage, pageSize, initialFilter, "published"),
    getAdminPostsPaginated(privatePage, pageSize, initialFilter, "draft"),
  ]);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <BlogManager
      initialMainPage={initialMainPage}
      initialPrivatePage={initialPrivatePage}
      initialSelectedId={initialSelectedId}
      initialFilter={initialFilter}
    />
  );
}
