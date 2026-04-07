import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { ProjectMeta } from "@/components/project/meta";
import { SectionTitle } from "@/components/ui/section-title";
import { stripMarkdownToPlainText } from "@/lib/blog/markdown";
import { isLocale, withLocalePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getPublishedProjectBySlug } from "@/lib/projects/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProjectDetailPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);
  const project = await getPublishedProjectBySlug(slug, lang);

  if (!project) {
    return {
      title: dictionary.projects.projectNotFound,
    };
  }

  return buildPageMetadata({
    locale: lang,
    pathname: `/projects/${slug}`,
    title: project.title,
    description: stripMarkdownToPlainText(project.summary),
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { lang, slug } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const project = await getPublishedProjectBySlug(slug, lang);

  if (!project) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <Link href={withLocalePath(lang, "/projects")} className="inline-flex text-sm text-muted underline">
          {dictionary.projects.backToList}
        </Link>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{project.title}</h1>
          <MarkdownContent markdown={project.summary} />
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border">
        <Image
          src={project.thumbnail}
          alt={`${project.title} thumbnail`}
          width={1200}
          height={675}
          className="h-full w-full object-cover"
        />
      </div>
      <ProjectMeta
        role={project.role}
        period={project.period}
        techStack={project.techStack}
        roleLabel={dictionary.projects.role}
        periodLabel={dictionary.projects.period}
        techStackLabel={dictionary.projects.techStack}
      />


      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <SectionTitle title={dictionary.projects.achievements} />
          <ul className="space-y-2">
            {project.achievements.map((item) => (
              <li key={item} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <SectionTitle title={dictionary.projects.contributions} />
          <ul className="space-y-2">
            {project.contributions.map((item) => (
              <li key={item} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle title={dictionary.projects.relatedLinks} />
        <ul className="flex flex-wrap gap-3 text-sm">
          {project.links.map((item) => (
            <li key={`${item.label}-${item.url}`}>
              <a href={item.url} target="_blank" rel="noreferrer" className="underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
