import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project/card";
import { ContentListLayout } from "@/components/ui/content-list-layout";
import { ContentPagination } from "@/components/ui/content-pagination";
import { ContentSearchToolbar } from "@/components/ui/content-search-toolbar";
import { SurfaceCard } from "@/components/ui/surface-card";
import { stripMarkdownToPlainText } from "@/lib/blog/markdown";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getAllPublishedProjects } from "@/lib/projects/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { matchesContentSearchQuery, normalizeContentSearchQuery } from "@/lib/utils/content-search";
import { PUBLIC_CONTENT_PAGE_SIZE, normalizePublicPage } from "@/lib/utils/pagination";
import { pickSingleQueryValue } from "@/lib/utils/search-params";

type ProjectsPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { lang } = await params;
  const query = await searchParams;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const projects = await getAllPublishedProjects(lang);
  const searchQuery = normalizeContentSearchQuery(pickSingleQueryValue(query.q));
  const filteredProjects = projects.filter((project) =>
    matchesContentSearchQuery(
      [
        project.title,
        project.homeSummary,
        stripMarkdownToPlainText(project.summary),
        project.techStack,
        project.achievements,
        project.contributions,
      ],
      searchQuery,
    ),
  );
  const requestedPage = normalizePublicPage(pickSingleQueryValue(query.page));
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PUBLIC_CONTENT_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * PUBLIC_CONTENT_PAGE_SIZE;
  const paginatedProjects = filteredProjects.slice(pageStart, pageStart + PUBLIC_CONTENT_PAGE_SIZE);

  return (
    <ContentListLayout
      title={dictionary.projects.listTitle}
      description={dictionary.projects.listDescription}
      toolbar={
        <ContentSearchToolbar
          placeholder={dictionary.projects.searchPlaceholder}
          submitLabel={dictionary.projects.searchButton}
          resetLabel={dictionary.projects.searchReset}
        />
      }
      listClassName="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
    >
      {paginatedProjects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          locale={lang}
          roleLabel={dictionary.projects.role}
          periodLabel={dictionary.projects.period}
          animationDelay={index * 70}
        />
      ))}
      {filteredProjects.length === 0 ? (
        <SurfaceCard className="col-span-full p-6 text-sm text-muted">
          {dictionary.projects.searchNoResult}
        </SurfaceCard>
      ) : null}
      {filteredProjects.length > 0 ? (
        <div className="col-span-full pt-2">
          <ContentPagination
            page={currentPage}
            totalPages={totalPages}
            total={filteredProjects.length}
            previousLabel={dictionary.projects.paginationPrevious}
            nextLabel={dictionary.projects.paginationNext}
            summaryLabel={dictionary.projects.paginationSummary}
          />
        </div>
      ) : null}
    </ContentListLayout>
  );
}
