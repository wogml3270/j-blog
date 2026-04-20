import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ProjectCommentsSection } from "@/components/project/comments-section";
import { ProjectMeta } from "@/components/project/meta";
import { SectionTitle } from "@/components/ui/section-title";
import { extractTocFromMarkdown, stripMarkdownToPlainText } from "@/lib/blog/markdown";
import { getApprovedCommentsByProjectSlug } from "@/lib/comments/repository";
import { isLocale, withLocalePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getPublishedProjectBySlug } from "@/lib/projects/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/format-date";
import { decodeSlugSegment, encodeSlugSegment } from "@/lib/utils/slug";

type ProjectDetailPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const normalizedSlug = decodeSlugSegment(slug);

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);
  let project = null;

  try {
    project = await getPublishedProjectBySlug(normalizedSlug, lang);
  } catch {
    return {
      title: dictionary.projects.title,
      description: dictionary.projects.description,
    };
  }

  if (!project) {
    return {
      title: dictionary.projects.projectNotFound,
    };
  }

  return buildPageMetadata({
    locale: lang,
    pathname: `/projects/${encodeSlugSegment(normalizedSlug)}`,
    title: project.title,
    description: stripMarkdownToPlainText(project.summary),
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { lang, slug } = await params;
  const normalizedSlug = decodeSlugSegment(slug);

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const project = await getPublishedProjectBySlug(normalizedSlug, lang);

  if (!project) {
    notFound();
  }

  const toc = extractTocFromMarkdown(project.summary);
  const publicLinks = project.links.filter((item) => item.isPublic);
  const comments = await getApprovedCommentsByProjectSlug(normalizedSlug);

  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <Link
          href={withLocalePath(lang, "/projects")}
          className="inline-flex text-sm text-muted underline"
        >
          {dictionary.projects.backToList}
        </Link>
        <p className="text-xs text-muted">
          {dictionary.projects.createdAt}:{" "}
          {project.createdAt ? formatDate(project.createdAt, lang) : "-"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{project.title}</h1>
        {project.homeSummary ? <p className="text-base text-muted">{project.homeSummary}</p> : null}
      </div>

      <section className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
        <div className="overflow-hidden rounded-xl border border-border lg:col-span-7">
          <Image
            src={project.thumbnail}
            alt={`${project.title} thumbnail`}
            width={1200}
            height={675}
            className="h-56 w-full object-cover sm:h-72 lg:h-full"
          />
        </div>

        <div className="lg:col-span-5">
          <ProjectMeta
            role={project.role}
            period={project.period}
            techStack={project.techStack}
            links={publicLinks}
            roleLabel={dictionary.projects.role}
            periodLabel={dictionary.projects.period}
            techStackLabel={dictionary.projects.techStack}
            relatedLinksLabel={dictionary.projects.relatedLinks}
          />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-9">
        <section className="space-y-3">
          <SectionTitle title={dictionary.projects.review} />
          <div className="rounded-xl border border-border bg-surface p-5">
            <MarkdownContent markdown={project.summary} />
          </div>
          <div className="flex flex-col items-end gap-y-1 text-xs text-muted">
            <p>
              {dictionary.projects.updatedAt}:{" "}
              {project.updatedAt ? formatDate(project.updatedAt, lang) : "-"}
            </p>
          </div>
        </section>
        <div className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
          <TableOfContents items={toc} title={dictionary.projects.tableOfContents} />
        </div>
      </div>

      <ProjectCommentsSection
        projectSlug={project.slug}
        labels={dictionary.projects.comments}
        initialComments={comments}
      />
    </article>
  );
}
