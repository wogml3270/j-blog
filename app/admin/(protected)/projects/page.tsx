import { ProjectsManager } from "@/components/admin/projects/projects-manager";
import { normalizeContentSearchQuery } from "@/lib/utils/content-search";
import { getAdminProjectsPaginated } from "@/lib/projects/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeAdminListSort, pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

function normalizeSectionPage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: AdminSearchParams;
}) {
  const query = await searchParams;
  const { pageSize } = normalizePagination(null, pickSingleQueryValue(query.pageSize));
  const initialSearchQuery = normalizeContentSearchQuery(pickSingleQueryValue(query.q));
  const initialSort = normalizeAdminListSort(pickSingleQueryValue(query.sort));
  const mainPage = normalizeSectionPage(pickSingleQueryValue(query.mainPage));
  const privatePage = normalizeSectionPage(pickSingleQueryValue(query.privatePage));
  const [initialMainPage, initialPrivatePage] = await Promise.all([
    getAdminProjectsPaginated(mainPage, pageSize, initialSearchQuery, initialSort, "published"),
    getAdminProjectsPaginated(privatePage, pageSize, initialSearchQuery, initialSort, "draft"),
  ]);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <ProjectsManager
      initialMainPage={initialMainPage}
      initialPrivatePage={initialPrivatePage}
      initialSelectedId={initialSelectedId}
      initialSort={initialSort}
      initialSearchQuery={initialSearchQuery}
    />
  );
}
