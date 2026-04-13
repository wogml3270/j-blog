import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project/card";
import { Button } from "@/components/ui/button";
import { ContentListLayout } from "@/components/ui/content-list-layout";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getAllPublishedProjects } from "@/lib/projects/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProjectsPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return buildPageMetadata({
    locale: lang,
    pathname: "/projects",
    title: dictionary.projects.title,
    description: dictionary.projects.description,
  });
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const projects = await getAllPublishedProjects(lang);

  return (
    <ContentListLayout
      title={dictionary.projects.listTitle}
      description={dictionary.projects.listDescription}
      toolbar={
        <SurfaceCard tone="surface" dashed padding="md">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              disabled
              placeholder={dictionary.projects.filterPlaceholder}
              aria-label={dictionary.projects.filterPlaceholder}
            />
            <Button disabled variant="outline">
              {dictionary.projects.filterButton}
            </Button>
          </form>
        </SurfaceCard>
      }
      listClassName="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          locale={lang}
          roleLabel={dictionary.projects.role}
          periodLabel={dictionary.projects.period}
          animationDelay={index * 70}
        />
      ))}
    </ContentListLayout>
  );
}
