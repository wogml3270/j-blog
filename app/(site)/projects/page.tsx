import type { Metadata } from "next";
import { ProjectCard } from "@/components/project/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { getAllProjects } from "@/lib/projects/data";

export const metadata: Metadata = {
  title: "Projects",
  description: "프로젝트 목록과 각 프로젝트의 역할/성과/기여 내용",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Projects"
        description="썸네일, 역할, 기간, 기술, 성과/기여를 확인할 수 있는 프로젝트 모음입니다."
      />

      <form className="grid gap-3 rounded-xl border border-dashed border-border bg-surface p-4 sm:grid-cols-[1fr_auto]">
        <Input disabled placeholder="프로젝트 필터/검색 영역 (추후 확장)" aria-label="프로젝트 검색 예정 입력" />
        <Button disabled variant="outline">
          검색 예정
        </Button>
      </form>

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
