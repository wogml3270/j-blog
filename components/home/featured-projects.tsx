import Link from "next/link";
import { ProjectCard } from "@/components/project/card";
import { SectionTitle } from "@/components/ui/section-title";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";
import type { Project } from "@/types/content";

type FeaturedProjectsProps = {
  locale: Locale;
  projects: Project[];
  title: string;
  description: string;
  allProjectsLabel: string;
  detailLabel: string;
};

export function FeaturedProjects({
  locale,
  projects,
  title,
  description,
  allProjectsLabel,
  detailLabel,
}: FeaturedProjectsProps) {
  return (
    <section aria-labelledby="featured-projects-title" className="space-y-6">
      <SectionTitle title={title} description={description} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            locale={locale}
            detailLabel={detailLabel}
            animationDelay={80 + index * 60}
          />
        ))}
      </div>
      <Link
        href={withLocalePath(locale, "/projects")}
        className="inline-flex text-sm font-medium text-foreground underline"
      >
        {allProjectsLabel}
      </Link>
    </section>
  );
}
