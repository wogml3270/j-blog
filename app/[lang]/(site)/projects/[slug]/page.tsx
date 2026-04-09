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
  const project = await getPublishedProjectBySlug(normalizedSlug, lang);

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

  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <Link
          href={withLocalePath(lang, "/projects")}
          className="inline-flex text-sm text-muted underline"
        >
          {dictionary.projects.backToList}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{project.title}</h1>
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
            roleLabel={dictionary.projects.role}
            periodLabel={dictionary.projects.period}
            techStackLabel={dictionary.projects.techStack}
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle title={dictionary.projects.review} />
        <div className="rounded-xl border border-border bg-surface p-5">
          <MarkdownContent markdown={project.summary} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <SectionTitle title={dictionary.projects.achievements} />
          <ul className="space-y-2">
            {project.achievements.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <SectionTitle title={dictionary.projects.contributions} />
          <ul className="space-y-2">
            {project.contributions.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground"
              >
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
