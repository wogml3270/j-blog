import Link from "next/link";
import { ProjectCard } from "@/components/project/card";
import { SectionTitle } from "@/components/ui/section-title";
import type { Project } from "@/types/content";

type FeaturedProjectsProps = {
  projects: Project[];
};

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <section aria-labelledby="featured-projects-title" className="space-y-6">
      <SectionTitle
        title="대표 프로젝트"
        description="문제 정의부터 운영까지 깊게 관여했던 프로젝트 3개를 소개합니다."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      <Link href="/projects" className="inline-flex text-sm font-medium text-foreground underline">
        전체 프로젝트 보기
      </Link>
    </section>
  );
}
