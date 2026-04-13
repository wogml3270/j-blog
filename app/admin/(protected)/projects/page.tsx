import { ProjectsManager } from "@/components/admin/projects/projects-manager";
import { getAdminProjectsPaginated } from "@/lib/projects/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeAdminListFilter, pickSingleQueryValue } from "@/lib/utils/search-params";
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
  const initialFilter = normalizeAdminListFilter(pickSingleQueryValue(query.filter));
  const mainPage = normalizeSectionPage(pickSingleQueryValue(query.mainPage));
  const privatePage = normalizeSectionPage(pickSingleQueryValue(query.privatePage));
  const [initialMainPage, initialPrivatePage] = await Promise.all([
    getAdminProjectsPaginated(mainPage, pageSize, initialFilter, "published"),
    getAdminProjectsPaginated(privatePage, pageSize, initialFilter, "draft"),
  ]);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <ProjectsManager
      initialMainPage={initialMainPage}
      initialPrivatePage={initialPrivatePage}
      initialSelectedId={initialSelectedId}
      initialFilter={initialFilter}
    />
  );
}
