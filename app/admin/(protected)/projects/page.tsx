import { ProjectsManager } from "@/components/admin/projects/projects-manager";
import { getAdminProjectsPaginated } from "@/lib/projects/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

export default async function AdminProjectsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const query = await searchParams;
  const { page, pageSize } = normalizePagination(
    pickSingleQueryValue(query.page),
    pickSingleQueryValue(query.pageSize),
  );
  const initialPage = await getAdminProjectsPaginated(page, pageSize);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">프로젝트 관리</h1>
      <ProjectsManager initialPage={initialPage} initialSelectedId={initialSelectedId} />
    </main>
  );
}
