import { ProjectsManager } from "@/components/admin/projects-manager";
import { getAdminProjects } from "@/lib/projects/repository";

type AdminProjectsPageProps = {
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

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const projects = await getAdminProjects();
  const query = await searchParams;
  const initialSelectedId = pickQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">프로젝트 관리</h1>
      <ProjectsManager initialProjects={projects} initialSelectedId={initialSelectedId} />
    </main>
  );
}
