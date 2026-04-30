import { BlogManager } from "@/components/admin/blog/blog-manager";
import { normalizeContentSearchQuery } from "@/lib/utils/content-search";
import { getAdminPostsPaginated } from "@/lib/blog/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeAdminListSort, pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

function normalizeSectionPage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminBlogPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const query = await searchParams;
  const { pageSize } = normalizePagination(null, pickSingleQueryValue(query.pageSize));
  const initialSearchQuery = normalizeContentSearchQuery(pickSingleQueryValue(query.q));
  const initialSort = normalizeAdminListSort(pickSingleQueryValue(query.sort));
  const mainPage = normalizeSectionPage(pickSingleQueryValue(query.mainPage));
  const privatePage = normalizeSectionPage(pickSingleQueryValue(query.privatePage));
  const [initialMainPage, initialPrivatePage] = await Promise.all([
    getAdminPostsPaginated(mainPage, pageSize, initialSearchQuery, initialSort, "published"),
    getAdminPostsPaginated(privatePage, pageSize, initialSearchQuery, initialSort, "draft"),
  ]);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <BlogManager
      initialMainPage={initialMainPage}
      initialPrivatePage={initialPrivatePage}
      initialSelectedId={initialSelectedId}
      initialSort={initialSort}
      initialSearchQuery={initialSearchQuery}
    />
  );
}
