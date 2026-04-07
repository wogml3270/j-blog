import { ProjectsManager } from "@/components/admin/projects/projects-manager";
import { getAdminProjects } from "@/lib/projects/repository";
import { pickSingleQueryValue } from "@/lib/utils/search-params";

type AdminProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const projects = await getAdminProjects();
  const query = await searchParams;
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">프로젝트 관리</h1>
      <ProjectsManager initialProjects={projects} initialSelectedId={initialSelectedId} />
    </main>
  );
}
