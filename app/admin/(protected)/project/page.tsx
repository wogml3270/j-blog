import { ProjectsManager } from "@/components/admin/projects-manager";
import { getAdminProjects } from "@/lib/projects/repository";

export default async function AdminProjectPage() {
  const projects = await getAdminProjects();

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Project 관리</h1>
      <ProjectsManager initialProjects={projects} />
    </main>
  );
}
